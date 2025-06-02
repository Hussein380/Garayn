import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase-admin";
import cloudinary from "@/lib/cloudinary";
import { v4 as uuidv4 } from "uuid";

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

        const formData = await request.formData();
        const file = formData.get('file') as File || formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed." },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        try {
            // Convert file to base64
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64String = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${base64String}`;

            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    dataURI,
                    {
                        folder: "garayn-projects",
                        resource_type: "auto",
                        public_id: uuidv4(),
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            if (!result || !('secure_url' in result)) {
                throw new Error('Failed to get upload URL from Cloudinary');
            }

            const publicUrl = (result as any).secure_url;

            // Log the upload
            await db.collection('uploads').add({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                uploadedBy: session.user.email,
                uploadedAt: new Date(),
                url: publicUrl,
                cloudinaryId: (result as any).public_id,
            });

            return NextResponse.json({ url: publicUrl });
        } catch (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json(
                { error: "Failed to upload to Cloudinary" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}

// Increase payload size limit
export const config = {
    api: {
        bodyParser: false,
    },
}; 