import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";
import { z } from "zod";

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
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const docRef = db.collection("projects").doc(params.id);
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

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const docRef = db.collection("projects").doc(params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validatedData = projectSchema.parse(body);

        const projectData = {
            ...validatedData,
            updatedAt: new Date(),
        };

        await docRef.update(projectData);

        return NextResponse.json({
            id: doc.id,
            ...projectData,
            createdAt: doc.data()?.createdAt?.toDate().toISOString(),
            updatedAt: projectData.updatedAt.toISOString(),
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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const docRef = db.collection("projects").doc(params.id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        const projectData = doc.data();
        const storage = getStorage();
        const bucket = storage.bucket();

        // Delete main image
        if (projectData?.image) {
            try {
                const imageUrl = new URL(projectData.image);
                const imagePath = decodeURIComponent(imageUrl.pathname.split('/o/')[1].split('?')[0]);
                await bucket.file(imagePath).delete();
            } catch (error) {
                console.error('Error deleting main image:', error);
            }
        }

        // Delete gallery images
        if (projectData?.gallery?.length > 0) {
            try {
                await Promise.all(
                    projectData.gallery.map(async (imageUrl: string) => {
                        try {
                            const url = new URL(imageUrl);
                            const imagePath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
                            await bucket.file(imagePath).delete();
                        } catch (error) {
                            console.error('Error deleting gallery image:', error);
                        }
                    })
                );
            } catch (error) {
                console.error('Error deleting gallery images:', error);
            }
        }

        // Delete the project document
        await docRef.delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
} 