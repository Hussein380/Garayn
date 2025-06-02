'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStats(data);
                setError(null);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setError('Failed to load dashboard stats. Please try again later.');
            }
        };

        fetchStats();
    }, []);

    const quickActions = [
        {
            title: 'New Project',
            description: 'Create a new project',
            icon: Plus,
            href: '/admin/projects/new',
            color: 'bg-blue-500'
        },
        {
            title: 'Manage Projects',
            description: 'View and edit all projects',
            icon: FolderKanban,
            href: '/admin/projects',
            color: 'bg-green-500'
        },
        {
            title: 'Settings',
            description: 'Configure admin settings',
            icon: Settings,
            href: '/admin/settings',
            color: 'bg-purple-500'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button asChild>
                    <Link href="/admin/projects/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {error ? (
                    <div className="col-span-3">
                        <Card className="bg-red-50 border-red-200">
                            <CardContent className="pt-6">
                                <p className="text-red-600">{error}</p>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                                <FolderKanban className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                                <FolderKanban className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completedProjects}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <div className={`p-2 rounded-lg ${action.color}`}>
                                        <action.icon className="h-4 w-4 text-white" />
                                    </div>
                                    <CardTitle className="text-lg">{action.title}</CardTitle>
                                </div>
                                <CardDescription>{action.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard; 