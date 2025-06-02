import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-error';

export async function GET() {
    try {
        // Check rate limit
        await checkRateLimit('dashboard', 10, 60000); // 10 requests per minute

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check admin role
        if (session.user.role !== 'admin') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Get all projects
        const projectsSnapshot = await db
            .collection('projects')
            .orderBy('updatedAt', 'desc')
            .limit(50)
            .get();

        // Calculate statistics
        const stats = {
            totalProjects: 0,
            byCategory: {} as Record<string, number>,
            byStatus: {} as Record<string, number>,
            recentActivity: [] as Array<{
                id: string;
                title: string;
                action: 'created' | 'updated' | 'deleted';
                timestamp: string;
            }>,
        };

        projectsSnapshot.forEach((doc) => {
            const project = doc.data();
            stats.totalProjects++;

            // Count by category
            const category = project.category || 'Uncategorized';
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            // Count by status
            const status = project.status || 'draft';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

            // Add to recent activity
            stats.recentActivity.push({
                id: doc.id,
                title: project.title,
                action: 'updated',
                timestamp: project.updatedAt,
            });
        });

        // Get recent deletions from activity log
        const activitySnapshot = await db
            .collection('activity_log')
            .where('action', '==', 'deleted')
            .where('type', '==', 'project')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        activitySnapshot.forEach((doc) => {
            const activity = doc.data();
            stats.recentActivity.push({
                id: doc.id,
                title: activity.title,
                action: 'deleted',
                timestamp: activity.timestamp,
            });
        });

        // Sort recent activity by timestamp
        stats.recentActivity.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Limit recent activity to last 10 items
        stats.recentActivity = stats.recentActivity.slice(0, 10);

        return NextResponse.json(stats);
    } catch (error) {
        return handleApiError(error);
    }
} 