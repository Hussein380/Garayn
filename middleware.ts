import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes that require admin access
const ADMIN_ROUTES = [
    '/admin/dashboard',
    '/admin/projects',
    '/admin/settings',
    '/api/admin'
];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/admin/login',
    '/api/auth'
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check if the route requires admin access
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    if (!isAdminRoute) {
        return NextResponse.next();
    }

    try {
        // Get the session token
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // If no token, redirect to login
        if (!token) {
            const url = new URL('/admin/login', request.url);
            url.searchParams.set('callbackUrl', encodeURI(request.url));
            return NextResponse.redirect(url);
        }

        // Verify admin role
        const isAdmin = token.role === 'admin' && token.isAdmin === true;
        if (!isAdmin) {
            // If not admin, redirect to login with error
            const url = new URL('/admin/login', request.url);
            url.searchParams.set('error', 'auth/admin-required');
            return NextResponse.redirect(url);
        }

        // Admin access granted
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        // On error, redirect to login
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('error', 'auth/server-error');
        return NextResponse.redirect(url);
    }
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        // Match all admin routes
        '/admin/:path*',
        // Match all admin API routes
        '/api/admin/:path*'
    ]
}; 