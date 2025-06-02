import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/firebase/adminApp';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Not authenticated',
                    email: null,
                    role: null
                }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // Get user document from Firestore
        const userDoc = await adminDb.collection('users').doc(session.user.email).get();
        const userData = userDoc.data();

        return new NextResponse(
            JSON.stringify({
                email: session.user.email,
                role: userData?.role || 'no role found',
                userData: userData || 'no user data found'
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error checking role:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
} 