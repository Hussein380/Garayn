import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword, getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/clientApp';
import { adminDb } from '@/firebase/adminApp';
import { checkRateLimit, recordLoginAttempt } from './rate-limit';

// Custom error types for better error handling
class AuthError extends Error {
    constructor(message: string, public code: string, public metadata?: any) {
        super(message);
        this.name = 'AuthError';
    }
}

// Error codes for different authentication scenarios
const AUTH_ERROR_CODES = {
    INVALID_CREDENTIALS: 'auth/invalid-credentials',
    ADMIN_REQUIRED: 'auth/admin-required',
    INVALID_EMAIL: 'auth/invalid-email',
    INVALID_PASSWORD: 'auth/invalid-password',
    RATE_LIMITED: 'auth/rate-limited',
    SERVER_ERROR: 'auth/server-error',
    PASSWORD_RESET_SENT: 'auth/password-reset-sent',
    PASSWORD_RESET_FAILED: 'auth/password-reset-failed',
    PASSWORD_RESET_INVALID: 'auth/password-reset-invalid',
    PASSWORD_RESET_EXPIRED: 'auth/password-reset-expired',
} as const;

/**
 * Request a password reset for an admin user
 */
export async function requestPasswordReset(email: string): Promise<void> {
    try {
        // Verify the user exists and is an admin
        const userDoc = await adminDb.collection('users').doc(email).get();
        const userData = userDoc.data();

        if (!userDoc.exists || !userData?.role || userData.role !== 'admin') {
            throw new AuthError('No admin account found with this email', AUTH_ERROR_CODES.PASSWORD_RESET_INVALID);
        }

        // Send password reset email
        await sendPasswordResetEmail(auth, email, {
            url: `${process.env.NEXTAUTH_URL}/admin/login?reset=success`,
            handleCodeInApp: false,
        });

        // Log the password reset request
        await adminDb.collection('passwordResetRequests').add({
            email,
            requestedAt: new Date(),
            status: 'sent',
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        });

    } catch (error) {
        console.error('Password reset error:', error);

        if (error instanceof AuthError) {
            throw error;
        }

        // Handle Firebase specific errors
        if (error instanceof Error) {
            const errorCode = (error as any).code;
            switch (errorCode) {
                case 'auth/user-not-found':
                    throw new AuthError('No account found with this email', AUTH_ERROR_CODES.PASSWORD_RESET_INVALID);
                case 'auth/too-many-requests':
                    throw new AuthError('Too many password reset attempts. Please try again later.', AUTH_ERROR_CODES.RATE_LIMITED);
                default:
                    throw new AuthError('Failed to send password reset email', AUTH_ERROR_CODES.PASSWORD_RESET_FAILED);
            }
        }

        throw new AuthError('An unexpected error occurred', AUTH_ERROR_CODES.SERVER_ERROR);
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    // Input validation
                    if (!credentials?.email) {
                        throw new AuthError('Email is required', AUTH_ERROR_CODES.INVALID_EMAIL);
                    }
                    if (!credentials?.password) {
                        throw new AuthError('Password is required', AUTH_ERROR_CODES.INVALID_PASSWORD);
                    }

                    // Email format validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(credentials.email)) {
                        throw new AuthError('Invalid email format', AUTH_ERROR_CODES.INVALID_EMAIL);
                    }

                    // Get client IP
                    const ip = req.headers?.['x-forwarded-for'] ||
                        req.headers?.['x-real-ip'] ||
                        'unknown';

                    // Check rate limit before attempting login
                    try {
                        await checkRateLimit(credentials.email, 10, 60000); // Use default limit and window
                    } catch (error) {
                        if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
                            // Extract remaining time from the error message if available
                            const match = error.message.match(/in (\d+) seconds/);
                            const remainingTime = match ? parseInt(match[1], 10) * 1000 : undefined; // Convert seconds to milliseconds
                            throw new AuthError(
                                'Too many login attempts. Please try again later.',
                                AUTH_ERROR_CODES.RATE_LIMITED,
                                {
                                    remainingTime: remainingTime
                                }
                            );
                        }
                        throw error; // Re-throw other errors
                    }

                    // Attempt to sign in
                    const userCredential = await signInWithEmailAndPassword(
                        auth,
                        credentials.email,
                        credentials.password
                    );

                    if (!userCredential.user) {
                        // Record failed attempt
                        await recordLoginAttempt(credentials.email, ip as string, false);
                        throw new AuthError('Invalid email or password', AUTH_ERROR_CODES.INVALID_CREDENTIALS);
                    }

                    // Get user role from Firestore
                    const userDoc = await adminDb.collection('users').doc(userCredential.user.email!).get();
                    const userData = userDoc.data();

                    if (!userData?.role) {
                        // Record failed attempt
                        await recordLoginAttempt(credentials.email, ip as string, false);
                        throw new AuthError('User role not found', AUTH_ERROR_CODES.SERVER_ERROR);
                    }

                    if (userData.role !== 'admin') {
                        // Record failed attempt
                        await recordLoginAttempt(credentials.email, ip as string, false);
                        throw new AuthError('Access denied. Admin privileges required.', AUTH_ERROR_CODES.ADMIN_REQUIRED);
                    }

                    if (!userCredential.user.email) {
                        throw new AuthError('User email not found', AUTH_ERROR_CODES.SERVER_ERROR);
                    }

                    // Record successful attempt
                    await recordLoginAttempt(credentials.email, ip as string, true);

                    // Return user data
                    return {
                        id: userCredential.user.uid,
                        email: userCredential.user.email,
                        name: userCredential.user.displayName,
                        role: userData.role,
                        isAdmin: userData.role === 'admin'
                    };
                } catch (error) {
                    // Handle Firebase Auth errors
                    if (error instanceof AuthError) {
                        throw error;
                    }

                    // Handle Firebase specific errors
                    if (error instanceof Error) {
                        const errorCode = (error as any).code;
                        switch (errorCode) {
                            case 'auth/too-many-requests':
                                throw new AuthError('Too many login attempts. Please try again later.', AUTH_ERROR_CODES.RATE_LIMITED);
                            case 'auth/user-not-found':
                            case 'auth/wrong-password':
                                throw new AuthError('Invalid email or password', AUTH_ERROR_CODES.INVALID_CREDENTIALS);
                            case 'auth/invalid-email':
                                throw new AuthError('Invalid email format', AUTH_ERROR_CODES.INVALID_EMAIL);
                            default:
                                console.error('Authentication error:', error);
                                throw new AuthError('An error occurred during authentication', AUTH_ERROR_CODES.SERVER_ERROR);
                        }
                    }

                    // Handle unknown errors
                    console.error('Unknown authentication error:', error);
                    throw new AuthError('An unexpected error occurred', AUTH_ERROR_CODES.SERVER_ERROR);
                }
            }
        })
    ],
    pages: {
        signIn: '/admin/login',
        error: '/admin/login'
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                // Initial sign in
                token.id = user.id;
                token.role = user.role;
                token.email = user.email;
                token.isAdmin = user.role === 'admin';
                token.lastRefreshed = Date.now();
            } else if (trigger === 'update') {
                // Update token on refresh
                token.lastRefreshed = Date.now();
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.email = token.email as string;
                session.user.isAdmin = token.isAdmin as boolean;
                session.lastRefreshed = token.lastRefreshed as number;
            }
            return session;
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours for admin sessions
        updateAge: 60 * 60, // Update session every hour
    },
    events: {
        async signOut({ token }) {
            // Clean up any session-related data
            if (token?.email) {
                try {
                    await adminDb.collection('sessions').doc(token.email).delete();
                } catch (error) {
                    console.error('Error cleaning up session:', error);
                }
            }
        },
        async signIn({ user }) {
            // Record successful login
            if (user?.email) {
                try {
                    await adminDb.collection('sessions').doc(user.email).set({
                        lastSignIn: new Date(),
                        lastActive: new Date(),
                        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
                    }, { merge: true });
                } catch (error) {
                    console.error('Error recording session:', error);
                }
            }
        },
        async createUser({ user }) {
            // Log new admin user creation
            if (user?.email) {
                try {
                    await adminDb.collection('userEvents').add({
                        type: 'user_created',
                        email: user.email,
                        timestamp: new Date(),
                        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
                    });
                } catch (error) {
                    console.error('Error logging user creation:', error);
                }
            }
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}; 