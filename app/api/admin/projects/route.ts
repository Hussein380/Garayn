import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase-admin';
import * as z from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateImageUpload } from '@/lib/image-validation';
import { Transaction } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Project schema for API validation
const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().min(1, "Description is required").max(500, "Description is too long"),
    image: z.string().url("Must be a valid URL").min(1, "Project image is required"),
    gallery: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    category: z.string().min(1, "Category is required"),
    url: z.string().url("Must be a valid URL").min(1, "Project URL is required"),
    client: z.string().min(1, "Client name is required"),
    year: z.string().min(4, "Year must be 4 digits").max(4, "Year must be 4 digits"),
    isPaid: z.boolean(),
    price: z.number().optional(),
    previewFeatures: z.array(z.string()).optional(),
    liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Helper function to validate admin access
async function validateAdminAccess() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(session.user.email).get();
    const userData = userDoc.data();

    if (!userData?.role || userData.role !== 'admin') {
        throw new Error('Forbidden');
    }

    return session.user.email;
}

// Helper function to handle API errors
function handleApiError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
        return NextResponse.json(
            {
                error: 'Validation Error',
                details: error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }))
            },
            { status: 400 }
        );
    }

    if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (error.message === 'Forbidden') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (error.message === 'Rate limit exceeded') {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }
        if (error.message === 'Invalid image') {
            return NextResponse.json({ error: 'Invalid image file' }, { status: 400 });
        }
    }

    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    );
}

// GET /api/admin/projects - Get all projects
export async function GET(request: Request) {
    try {
        // Check rate limit
        await checkRateLimit('projects-list', 10, 60000); // 10 requests per minute

        await validateAdminAccess();

        const projectsSnapshot = await db.collection("projects")
            .orderBy("createdAt", "desc")
            .get();

        const projects = projectsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString(),
            updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        }));

        return NextResponse.json(projects);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/admin/projects - Create a new project
export async function POST(request: Request) {
    try {
        // Check rate limit
        await checkRateLimit('project-create', 5, 60000); // 5 requests per minute

        const userEmail = await validateAdminAccess();
        const body = await request.json();

        // Validate request body
        const validatedData = projectSchema.parse(body);

        // Validate image URLs
        await validateImageUpload(validatedData.image);
        if (validatedData.gallery) {
            await Promise.all(validatedData.gallery.map(url => validateImageUpload(url)));
        }

        // Use a transaction to ensure data consistency
        const result = await db.runTransaction(async (transaction: Transaction) => {
            // First, read the user document
            const userRef = db.collection('users').doc(userEmail);
            const userDoc = await transaction.get(userRef);
            const userData = userDoc.data();

            // Then create project document
            const projectRef = db.collection("projects").doc();
            const projectData = {
                ...validatedData,
                createdBy: userEmail,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Now perform all writes
            transaction.set(projectRef, projectData);
            transaction.update(userRef, {
                projectCount: (userData?.projectCount || 0) + 1,
                lastProjectCreated: new Date()
            });

            return { id: projectRef.id, ...projectData };
        });

        return NextResponse.json({
            ...result,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
        });
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/admin/projects?id=projectId - Delete a project
export async function DELETE(request: Request) {
    try {
        // Check rate limit
        await checkRateLimit('project-delete', 5, 60000); // 5 requests per minute

        const userEmail = await validateAdminAccess();

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('id');

        if (!projectId) {
            return NextResponse.json(
                { error: 'Project ID is required' },
                { status: 400 }
            );
        }

        // Use a transaction to ensure data consistency
        await db.runTransaction(async (transaction: Transaction) => {
            const projectRef = db.collection('projects').doc(projectId);
            const userRef = db.collection('users').doc(userEmail);

            // Perform all reads first
            const projectDoc = await transaction.get(projectRef);
            const userDoc = await transaction.get(userRef);

            if (!projectDoc.exists) {
                throw new Error('Project not found');
            }

            const userData = userDoc.data(); // Get user data after reading

            // Now perform all writes
            transaction.delete(projectRef);

            transaction.update(userRef, {
                projectCount: Math.max(0, (userData?.projectCount || 0) - 1),
                lastProjectDeleted: new Date()
            });
        });

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        // Log the detailed error before specific handling
        console.error("Detailed error during project deletion:", error);

        if (error instanceof Error && error.message === 'Project not found') {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }
        return handleApiError(error);
    }
} 