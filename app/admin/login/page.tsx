'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

// Error code to user-friendly message mapping
const ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-credentials': 'Invalid email or password',
    'auth/admin-required': 'Access denied. Admin privileges required.',
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/invalid-password': 'Password is required',
    'auth/rate-limited': 'Too many login attempts. Please try again later.',
    'auth/server-error': 'An error occurred. Please try again later.',
    'default': 'An unexpected error occurred. Please try again.'
};

interface ErrorState {
    message: string;
    remainingTime?: number;
    attemptsLeft?: number;
}

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ErrorState | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    // Handle error from URL parameters (e.g., when redirected from middleware)
    useEffect(() => {
        const errorCode = searchParams.get('error');
        if (errorCode) {
            setError({
                message: ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default
            });
        }
    }, [searchParams]);

    // Handle password reset success message
    const resetSuccess = searchParams.get('reset') === 'success';
    if (resetSuccess) {
        toast({
            title: 'Password Reset Email Sent',
            description: 'Please check your email for instructions to reset your password.',
            variant: 'default',
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                // Extract error code and metadata from the error message
                const [errorCode, metadataStr] = result.error.split('|');
                let metadata;
                try {
                    metadata = metadataStr ? JSON.parse(metadataStr) : undefined;
                } catch {
                    metadata = undefined;
                }

                const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default;
                setError({
                    message: errorMessage,
                    ...metadata
                });

                // Show toast with appropriate message
                if (metadata?.remainingTime) {
                    const remainingTime = metadata.remainingTime; // in milliseconds
                    const minutes = Math.floor(remainingTime / 60000);
                    const seconds = Math.ceil((remainingTime % 60000) / 1000);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `${errorMessage} (${minutes}m ${seconds}s remaining)`
                    });
                } else if (metadata?.attemptsLeft) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: `${errorMessage} (${metadata.attemptsLeft} attempts remaining)`
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: errorMessage
                    });
                }
                return;
            }

            // Successful login
            toast({
                title: "Success",
                description: "Successfully logged in",
                variant: "default"
            });
            router.push('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setError({
                message: ERROR_MESSAGES.default
            });
            toast({
                variant: "destructive",
                title: "Error",
                description: ERROR_MESSAGES.default
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsResetting(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send reset email');
            }

            toast({
                title: 'Reset Email Sent',
                description: 'Please check your email for instructions to reset your password.',
                variant: 'default',
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to send reset email');
        } finally {
            setIsResetting(false);
        }
    };

    const getErrorAlert = () => {
        if (!error) return null;

        const isRateLimited = error.remainingTime !== undefined;
        const hasAttemptsLeft = error.attemptsLeft !== undefined && error.attemptsLeft > 0;

        return (
            <Alert
                variant={isRateLimited ? "destructive" : "warning"}
                className="mb-4"
            >
                {isRateLimited ? (
                    <AlertCircle className="h-4 w-4" />
                ) : (
                    <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>
                    {error.message}
                    {error.remainingTime && (
                        <div className="mt-1 text-sm">
                            Please try again in {error.remainingTime} seconds
                        </div>
                    )}
                    {hasAttemptsLeft && (
                        <div className="mt-1 text-sm">
                            {error.attemptsLeft} attempt{error.attemptsLeft !== 1 ? 's' : ''} remaining
                        </div>
                    )}
                </AlertDescription>
            </Alert>
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    {getErrorAlert()}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                required
                                placeholder="Enter your email"
                                disabled={isLoading || isResetting || (error?.remainingTime !== undefined)}
                                className={error ? 'border-destructive' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(null);
                                }}
                                required
                                placeholder="Enter your password"
                                disabled={isLoading || isResetting || (error?.remainingTime !== undefined)}
                                className={error ? 'border-destructive' : ''}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || isResetting || (error?.remainingTime !== undefined)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : error?.remainingTime ? (
                                'Please wait...'
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleResetPassword}>
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={isLoading || isResetting}
                            className="w-full"
                        >
                            {isResetting ? 'Sending Reset Email...' : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 