import { NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth';
import { z } from 'zod';

// Input validation schema
const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const { email } = resetPasswordSchema.parse(body);

        // Request password reset
        await requestPasswordReset(email);

        return NextResponse.json({
            success: true,
            message: 'Password reset email sent'
        });

    } catch (error) {
        console.error('Password reset request error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid input',
                    details: error.errors
                },
                { status: 400 }
            );
        }

        // Handle AuthError
        if (error instanceof Error && 'code' in error) {
            const authError = error as { code: string; message: string };
            return NextResponse.json(
                {
                    success: false,
                    error: authError.message,
                    code: authError.code
                },
                { status: 400 }
            );
        }

        // Handle unknown errors
        return NextResponse.json(
            {
                success: false,
                error: 'An unexpected error occurred'
            },
            { status: 500 }
        );
    }
} 