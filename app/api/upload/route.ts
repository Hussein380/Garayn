import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStorage } from 'firebase-admin/storage';
import { adminApp } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const storage = getStorage(adminApp);
        const bucket = storage.bucket();

        // Create a unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        const fileBuffer = Buffer.from(buffer);

        // Upload to Firebase Storage
        const fileRef = bucket.file(`projects/${filename}`);
        await fileRef.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // Get the public URL
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500', // Far future expiration
        });

        return NextResponse.json({ url });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
} 