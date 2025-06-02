'use server';

import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase-admin';

// In-memory store for rate limiting (in production, consider using Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetAt: Timestamp }>();

export async function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): Promise<void> {
    const now = Timestamp.now();
    const key = `rate-limit:${identifier}`;
    const current = rateLimitStore.get(key);

    if (current) {
        if (now.toMillis() >= current.resetAt.toMillis()) {
            // Reset if window has passed
            rateLimitStore.set(key, { count: 1, resetAt: Timestamp.fromMillis(now.toMillis() + windowMs) });
        } else if (current.count >= limit) {
            // Rate limit exceeded
            const remainingTime = Math.ceil((current.resetAt.toMillis() - now.toMillis()) / 1000);
            throw new Error(`Rate limit exceeded. Try again in ${remainingTime} seconds.`);
        } else {
            // Increment counter
            rateLimitStore.set(key, { count: current.count + 1, resetAt: current.resetAt });
        }
    } else {
        // First request
        rateLimitStore.set(key, { count: 1, resetAt: Timestamp.fromMillis(now.toMillis() + windowMs) });
    }
}

export async function resetRateLimit(identifier: string): Promise<void> {
    const key = `rate-limit:${identifier}`;
    rateLimitStore.delete(key);
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
    try {
        const now = new Date();
        await db.collection('loginAttempts').add({
            email,
            ip,
            timestamp: now,
            success,
        });

        // Optional: Clean up old attempts (e.g., older than 24 hours)
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oldAttemptsSnapshot = await db.collection('loginAttempts')
            .where('timestamp', '<=', twentyFourHoursAgo)
            .limit(100) // Process in batches
            .get();

        if (!oldAttemptsSnapshot.empty) {
            const batch = db.batch();
            oldAttemptsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Cleaned up ${oldAttemptsSnapshot.size} old login attempts.`);
        }

    } catch (error) {
        console.error('Error recording login attempt:', error);
    }
}

// Helper function to get remaining attempts
export async function getRateLimitInfo(identifier: string): Promise<{ remaining: number; resetAt: Date } | null> {
    const key = `rate-limit:${identifier}`;
    const current = rateLimitStore.get(key);

    if (!current) {
        return null;
    }

    const now = Timestamp.now();
    if (now.toMillis() >= current.resetAt.toMillis()) {
        return null;
    }

    return {
        remaining: Math.max(0, 10 - current.count), // Assuming limit of 10
        resetAt: current.resetAt.toDate()
    };
} 