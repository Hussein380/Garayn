import { getSession } from 'next-auth/react';
import { adminDb } from '@/firebase/adminApp';

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SESSION_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if the current session needs to be refreshed
 */
export async function shouldRefreshSession(): Promise<boolean> {
    const session = await getSession();
    if (!session?.lastRefreshed) return true;

    const timeSinceLastRefresh = Date.now() - session.lastRefreshed;
    return timeSinceLastRefresh >= SESSION_REFRESH_INTERVAL;
}

/**
 * Check if the current session has expired
 */
export async function isSessionExpired(): Promise<boolean> {
    const session = await getSession();
    if (!session?.lastRefreshed) return true;

    const timeSinceLastRefresh = Date.now() - session.lastRefreshed;
    return timeSinceLastRefresh >= SESSION_TIMEOUT;
}

/**
 * Update the last active timestamp for a user's session
 */
export async function updateLastActive(email: string): Promise<void> {
    try {
        await adminDb.collection('sessions').doc(email).update({
            lastActive: new Date(),
        });
    } catch (error) {
        console.error('Error updating last active timestamp:', error);
    }
}

/**
 * Clean up expired sessions from the database
 * This should be run periodically (e.g., via a cron job)
 */
export async function cleanupExpiredSessions(): Promise<void> {
    const expiryDate = new Date(Date.now() - SESSION_TIMEOUT);

    try {
        const expiredSessions = await adminDb.collection('sessions')
            .where('lastActive', '<', expiryDate)
            .get();

        const batch = adminDb.batch();
        expiredSessions.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Cleaned up ${expiredSessions.size} expired sessions`);
    } catch (error) {
        console.error('Error cleaning up expired sessions:', error);
    }
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(email: string): Promise<any[]> {
    try {
        const sessions = await adminDb.collection('sessions')
            .doc(email)
            .get();

        if (!sessions.exists) return [];

        const data = sessions.data();
        return [{
            lastSignIn: data?.lastSignIn,
            lastActive: data?.lastActive,
            userAgent: data?.userAgent,
        }];
    } catch (error) {
        console.error('Error getting user sessions:', error);
        return [];
    }
} 