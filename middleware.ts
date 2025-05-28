import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        // Add any additional middleware logic here
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/admin/login',
        },
    }
);

// Protect all admin routes except login
export const config = {
    matcher: [
        '/admin/:path*',
        '/((?!admin/login|_next/static|_next/image|favicon.ico).*)',
    ],
}; 