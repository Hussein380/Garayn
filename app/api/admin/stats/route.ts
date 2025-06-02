import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/firebase/adminApp';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { 
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Verify admin role
        const userDoc = await adminDb.collection('users').doc(session.user.email).get();
        const userData = userDoc.data();

        if (!userData?.role || userData.role !== 'admin') {
            return new NextResponse(
                JSON.stringify({ error: 'Forbidden' }),
                { 
                    status: 403,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Get projects stats
        const projectsSnapshot = await adminDb.collection('projects').get();
        const projects = projectsSnapshot.docs.map(doc => doc.data());

        const stats = {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'active').length,
            completedProjects: projects.filter(p => p.status === 'completed').length
        };

        return new NextResponse(
            JSON.stringify(stats),
            { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Internal server error' }),
            { 
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
} 