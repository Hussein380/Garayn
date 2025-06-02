import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            role: string;
            isAdmin: boolean;
        } & DefaultSession['user'];
        lastRefreshed: number;
    }

    interface User {
        id: string;
        email: string;
        name?: string | null;
        role: string;
        isAdmin: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        isAdmin: boolean;
        lastRefreshed: number;
    }
} 