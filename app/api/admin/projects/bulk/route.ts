import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-error';
import { z } from 'zod';

// Validation schemas
const bulkDeleteSchema = z.object({
    ids: z.array(z.string()).min(1),
});

const bulkUpdateSchema = z.object({
    ids: z.array(z.string()).min(1),
    status: z.enum(['draft', 'active', 'completed', 'archived']),
});

export async function DELETE(request: Request) {
    try {
        // Check rate limit
        await checkRateLimit('bulk-delete', 5, 60000); // 5 requests per minute

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check admin role
        if (session.user.role !== 'admin') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Validate request body
        const body = await request.json();
        const { ids } = bulkDeleteSchema.parse(body);

        // Use a transaction to ensure data consistency
        await db.runTransaction(async (transaction) => {
            // Get all projects to be deleted
            const projectsSnapshot = await Promise.all(
                ids.map(id => db.collection('projects').doc(id).get())
            );

            // Verify all projects exist and can be deleted
            for (const doc of projectsSnapshot) {
                if (!doc.exists) {
                    throw new Error(`Project ${doc.id} not found`);
                }
            }

            // Delete projects and update activity log
            const batch = db.batch();

            for (const doc of projectsSnapshot) {
                const project = doc.data();

                // Delete the project
                batch.delete(doc.ref);

                // Add to activity log
                const activityRef = db.collection('activity_log').doc();
                batch.set(activityRef, {
                    type: 'project',
                    action: 'deleted',
                    title: project.title,
                    userId: session.user.id,
                    timestamp: new Date().toISOString(),
                });
            }

            // Commit the batch
            await batch.commit();
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: Request) {
    try {
        // Check rate limit
        await checkRateLimit('bulk-update', 5, 60000); // 5 requests per minute

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check admin role
        if (session.user.role !== 'admin') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Validate request body
        const body = await request.json();
        const { ids, status } = bulkUpdateSchema.parse(body);

        // Use a transaction to ensure data consistency
        await db.runTransaction(async (transaction) => {
            // Get all projects to be updated
            const projectsSnapshot = await Promise.all(
                ids.map(id => db.collection('projects').doc(id).get())
            );

            // Verify all projects exist
            for (const doc of projectsSnapshot) {
                if (!doc.exists) {
                    throw new Error(`Project ${doc.id} not found`);
                }
            }

            // Update projects and activity log
            const batch = db.batch();
            const timestamp = new Date().toISOString();

            for (const doc of projectsSnapshot) {
                const project = doc.data();

                // Update the project
                batch.update(doc.ref, {
                    status,
                    updatedAt: timestamp,
                    updatedBy: session.user.id,
                });

                // Add to activity log
                const activityRef = db.collection('activity_log').doc();
                batch.set(activityRef, {
                    type: 'project',
                    action: 'updated',
                    title: project.title,
                    userId: session.user.id,
                    timestamp,
                    details: {
                        status,
                    },
                });
            }

            // Commit the batch
            await batch.commit();
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
} 