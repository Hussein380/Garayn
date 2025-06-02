'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ProjectCard from "@/components/ProjectCard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { handleApiResponse, getErrorMessage, isAuthError, isRateLimitError } from '@/lib/api-error';
import { useSession } from 'next-auth/react';

// Categories for filtering
const CATEGORIES = ["All", "Web Development", "Mobile App", "Desktop App", "E-commerce", "Landing Page", "Portfolio", "Blog", "Other"];
const YEARS = ["All", "2024", "2023", "2022", "2021"];

type Project = {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    category: string;
    url: string;
    client: string;
    year: string;
    isPaid: boolean;
    price?: number;
    previewFeatures?: string[];
    liveUrl?: string;
    videoUrl?: string;
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
};

export default function ProjectsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [yearFilter, setYearFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/admin/projects');
                const data = await handleApiResponse<Project[]>(response);
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);

                if (isAuthError(error)) {
                    toast.error('Please sign in to view projects');
                    router.push('/auth/signin');
                    return;
                }

                if (isRateLimitError(error)) {
                    toast.error('Too many requests. Please try again later.');
                    return;
                }

                toast.error(getErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchProjects();
        } else if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    // Handle project deletion
    const handleDelete = async (project: Project) => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/projects?id=${project.id}`, {
                method: 'DELETE',
            });

            await handleApiResponse(response);
            setProjects(projects.filter(p => p.id !== project.id));
            toast.success('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);

            if (isAuthError(error)) {
                toast.error('Please sign in to delete projects');
                router.push('/auth/signin');
                return;
            }

            if (isRateLimitError(error)) {
                toast.error('Too many requests. Please try again later.');
                return;
            }

            toast.error(getErrorMessage(error));
        } finally {
            setIsDeleting(false);
            setProjectToDelete(null);
        }
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            project.client.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "All" || project.category === categoryFilter;
        const matchesYear = yearFilter === "All" || project.year === yearFilter;
        const matchesStatus = statusFilter === "All" || project.status === statusFilter;
        return matchesSearch && matchesCategory && matchesYear && matchesStatus;
    });

    if (status === 'loading' || isLoading) {
        // Replace full page spinner with skeleton loader
        return (
            <div className="container mx-auto py-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <Button disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Project List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                            <div className="flex flex-1 gap-4">
                                <div className="relative flex-1 w-full">
                                    <div className="animate-pulse h-10 w-full rounded-md bg-gray-200"></div>
                                </div>
                                <div className="animate-pulse h-10 w-[180px] rounded-md bg-gray-200"></div>
                                <div className="animate-pulse h-10 w-[120px] rounded-md bg-gray-200"></div>
                                <div className="animate-pulse h-10 w-[140px] rounded-md bg-gray-200"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Skeleton Cards */}
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Card key={index} className="animate-pulse">
                                    <CardContent className="p-6">
                                        <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
                                        <div className="h-6 bg-gray-200 rounded-md mb-2 w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Projects</h1>
                <Button onClick={() => router.push('/admin/projects/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                        <div className="flex flex-1 gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Display error message if projects fail to load */}
                    {!isLoading && projects.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                            <p>Could not load projects. Please try again.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="relative">
                                    <ProjectCard project={project} />
                                    {/* Admin Actions Overlay */}
                                    <motion.div
                                        className="absolute top-4 right-4 z-30"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => router.push(`/admin/projects/${project.id}`)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setProjectToDelete(project)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!projectToDelete}
                onOpenChange={(open) => !open && setProjectToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the project
                            "{projectToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => projectToDelete && handleDelete(projectToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 