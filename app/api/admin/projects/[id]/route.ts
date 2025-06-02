import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { z } from "zod";

export const dynamic = 'force-dynamic';

const projectStatusSchema = z.enum(['draft', 'active', 'completed', 'archived']);

const statusHistorySchema = z.object({
    status: projectStatusSchema,
    changedBy: z.string().email(),
    changedAt: z.date(),
    reason: z.string().optional(),
});

const projectSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    image: z.string().url(),
    gallery: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).min(1),
    category: z.string().min(1),
    url: z.string().url(),
    client: z.string().min(1),
    year: z.string().min(4).max(4),
    isPaid: z.boolean(),
    price: z.number().optional(),
    previewFeatures: z.array(z.string()).optional(),
    liveUrl: z.string().url().optional().or(z.literal("")),
    videoUrl: z.string().url().optional().or(z.literal("")),
    githubUrl: z.string().url().optional().or(z.literal("")),
    status: projectStatusSchema.optional(),
    statusHistory: z.array(statusHistorySchema).optional(),
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify admin role
        const userDoc = await db.collection('users').doc(session.user.email).get();
        const userData = userDoc.data();

        if (!userData?.role || userData.role !== 'admin') {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const projectId = (await params).id;

        if (!projectId) {
            return NextResponse.json(
                { error: "Project ID is missing" },
                { status: 400 }
            );
        }

        const docRef = db.collection("projects").doc(projectId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const data = doc.data();
        return NextResponse.json({
            id: doc.id,
            ...data,
            createdAt: data?.createdAt?.toDate().toISOString(),
            updatedAt: data?.updatedAt?.toDate().toISOString(),
        });
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify admin role
        const userDoc = await db.collection('users').doc(session.user.email).get();
        const userData = userDoc.data();

        if (!userData?.role || userData.role !== 'admin') {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const projectId = (await params).id;

        const docRef = db.collection("projects").doc(projectId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validatedData = projectSchema.parse(body);

        // Get current project data
        const currentData = doc.data();
        const currentStatus = currentData?.status || 'draft';
        const newStatus = validatedData.status;

        // If status has changed, add to history
        if (currentStatus !== newStatus) {
            const statusHistory = currentData?.statusHistory || [];
            statusHistory.push({
                status: newStatus,
                changedBy: session.user.email,
                changedAt: new Date(),
                reason: body.statusChangeReason, // Optional reason for status change
            });
            validatedData.statusHistory = statusHistory;
        }

        const projectData = {
            ...validatedData,
            updatedAt: new Date(),
        };

        await docRef.update(projectData);

        return NextResponse.json({
            id: doc.id,
            ...projectData,
            createdAt: doc.data()?.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: projectData?.updatedAt?.toDate?.()?.toISOString() || null,
            statusHistory: projectData?.statusHistory?.map(entry => ({
                ...entry,
                changedAt: entry.changedAt?.toDate?.()?.toISOString() || (entry.changedAt ? new Date(entry.changedAt as any).toISOString() : null)
            })) || [],
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid project data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

// Add new endpoint for status changes
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify admin role
        const userDoc = await db.collection('users').doc(session.user.email).get();
        const userData = userDoc.data();

        if (!userData?.role || userData.role !== 'admin') {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const projectId = (await params).id;

        const docRef = db.collection('projects').doc(projectId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { status, reason } = body;

        // Validate status
        const validatedStatus = projectStatusSchema.parse(status);

        // Get current project data
        const currentData = doc.data();
        const currentStatus = currentData?.status || 'draft';

        // Only update if status has changed
        if (currentStatus !== validatedStatus) {
            const statusHistory = currentData?.statusHistory || [];
            const newStatusEntry = {
                status: validatedStatus,
                changedBy: session.user.email,
                changedAt: new Date(),
                ...(reason && reason.trim() ? { reason: reason.trim() } : {})
            };

            statusHistory.push(newStatusEntry);

            const updateData = {
                status: validatedStatus,
                updatedAt: new Date(),
                statusHistory: statusHistory,
                ...(validatedStatus === 'completed' ? { completedAt: new Date() } : {}),
                ...(validatedStatus === 'archived' ? { archivedAt: new Date() } : {})
            };

            await docRef.update(updateData);

            // Get the updated document
            const updatedDoc = await docRef.get();
            const updatedData = updatedDoc.data();

            return NextResponse.json({
                id: doc.id,
                ...updatedData,
                createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || null,
                updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || null,
                statusHistory: updatedData?.statusHistory?.map(entry => ({
                    ...entry,
                    changedAt: entry.changedAt?.toDate?.()?.toISOString() || (entry.changedAt ? new Date(entry.changedAt as any).toISOString() : null)
                })) || [],
            });
        } else {
            return NextResponse.json({ message: "Status not changed" }, { status: 200 });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid status data", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating project status:", error);
        return NextResponse.json(
            { error: "Failed to update project status" },
            { status: 500 }
        );
    }
} 