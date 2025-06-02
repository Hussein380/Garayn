import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

export class AdminAuthError extends Error {
    constructor(message: string, public code: string = 'auth/admin-required') {
        super(message);
        this.name = 'AdminAuthError';
    }
}

/**
 * Verify admin access for API routes
 * @throws {AdminAuthError} If user is not authenticated or not an admin
 */
export async function verifyAdminAccess(req: NextRequest | NextApiRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new AdminAuthError('Authentication required');
    }

    if (session.user.role !== 'admin' || !session.user.isAdmin) {
        throw new AdminAuthError('Admin access required');
    }

    return session;
}

/**
 * Wrapper for API routes that require admin access
 */
export function withAdminAuth(handler: Function) {
    return async function (req: NextApiRequest, res: NextApiResponse) {
        try {
            await verifyAdminAccess(req);
            return handler(req, res);
        } catch (error) {
            if (error instanceof AdminAuthError) {
                return res.status(401).json({
                    error: error.code,
                    message: error.message
                });
            }
            console.error('Admin auth error:', error);
            return res.status(500).json({
                error: 'auth/server-error',
                message: 'An error occurred while verifying admin access'
            });
        }
    };
}

/**
 * Middleware for API routes that require admin access
 */
export async function adminApiMiddleware(req: NextRequest) {
    try {
        await verifyAdminAccess(req);
        return NextResponse.next();
    } catch (error) {
        if (error instanceof AdminAuthError) {
            return NextResponse.json(
                {
                    error: error.code,
                    message: error.message
                },
                { status: 401 }
            );
        }
        console.error('Admin API middleware error:', error);
        return NextResponse.json(
            {
                error: 'auth/server-error',
                message: 'An error occurred while verifying admin access'
            },
            { status: 500 }
        );
    }
} 