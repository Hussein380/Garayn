import sharp from 'sharp';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 2000; // 2000px
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function validateImageUpload(imageUrl: string): Promise<void> {
    try {
        // Fetch the image
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !ALLOWED_IMAGE_TYPES.includes(contentType)) {
            throw new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed');
        }

        // Get image buffer
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > MAX_IMAGE_SIZE) {
            throw new Error(`Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit`);
        }

        // Check image dimensions
        const metadata = await sharp(Buffer.from(buffer)).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Could not determine image dimensions');
        }

        if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
            throw new Error(`Image dimensions exceed ${MAX_IMAGE_DIMENSION}px limit`);
        }

        // Validate image integrity
        try {
            await sharp(Buffer.from(buffer)).stats();
        } catch (error) {
            throw new Error('Invalid or corrupted image file');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Invalid image: ${error.message}`);
        }
        throw new Error('Invalid image');
    }
} 