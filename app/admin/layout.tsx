'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from '@/components/theme-toggle';
import {
    LayoutDashboard,
    FolderKanban,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated' && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [status, router, pathname]);

    // Handle navigation state
    useEffect(() => {
        const handleStart = () => setIsNavigating(true);
        const handleEnd = () => setIsNavigating(false);

        router.events?.on('routeChangeStart', handleStart);
        router.events?.on('routeChangeComplete', handleEnd);
        router.events?.on('routeChangeError', handleEnd);

        return () => {
            router.events?.off('routeChangeStart', handleStart);
            router.events?.off('routeChangeComplete', handleEnd);
            router.events?.off('routeChangeError', handleEnd);
        };
    }, [router]);

    // Don't render the admin layout on the login page
    if (pathname === '/admin/login') {
        return children;
    }

    if (status === 'loading') {
        return <Loading fullScreen />;
    }

    if (!session) {
        return null; // This will trigger the redirect in useEffect
    }

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard
        },
        {
            name: 'Projects',
            href: '/admin/projects',
            icon: FolderKanban
        },
        {
            name: 'Settings',
            href: '/admin/settings',
            icon: Settings
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 right-4 z-50 flex items-center gap-2">
                <ThemeToggle />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative z-50"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed inset-y-0 right-0 w-64 bg-card border-l z-40 p-4"
                        >
                            {/* Mobile menu content */}
                            <nav className="flex flex-col gap-2 mt-16">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                                            pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex">
                <div className="fixed inset-y-0 left-0 w-64 bg-card border-r p-4">
                    <div className="h-full px-3 py-4 overflow-y-auto">
                        <div className="mb-8 px-2 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Admin Panel</h2>
                                <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                            </div>
                            <div className="hidden lg:block">
                                <ThemeToggle />
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center px-2 py-2 text-foreground rounded-lg hover:bg-muted group ${pathname === item.href ? 'bg-muted' : ''
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="absolute bottom-4 left-0 right-0 px-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="pl-64 flex-1">
                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isNavigating ? <Loading fullScreen /> : children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile content */}
            <div className="lg:hidden">
                <div className="p-4 pt-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isNavigating ? <Loading fullScreen /> : children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
} 