'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Loading } from '@/components/ui/loading';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from 'next-auth/react';
import { handleApiResponse, getErrorMessage, isAuthError, isRateLimitError, isValidationError } from '@/lib/api-error';
import React from 'react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().min(1, "Description is required").max(500, "Description is too long"),
    image: z.string().url("Must be a valid URL").min(1, "Project image is required"),
    gallery: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).min(1, "At least one tag is required"),
    category: z.string().min(1, "Category is required"),
    url: z.string().url("Must be a valid URL").min(1, "Project URL is required"),
    client: z.string().min(1, "Client name is required"),
    year: z.string().min(4, "Year must be 4 digits").max(4, "Year must be 4 digits"),
    isPaid: z.boolean(),
    price: z.number().optional(),
    previewFeatures: z.array(z.string()).optional(),
    liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    status: z.enum(['draft', 'active', 'completed', 'archived']),
    statusHistory: z.array(z.object({
        status: z.enum(['draft', 'active', 'completed', 'archived']),
        changedBy: z.string().email(),
        changedAt: z.date(),
        reason: z.string().optional(),
    })).optional(),
    content: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const categories = [
    "Web Application",
    "Mobile App",
    "Desktop App",
    "E-commerce",
    "Landing Page",
    "Portfolio",
    "Blog",
    "Other"
];

export default function ProjectFormPage({
    params
}: {
    params: { action: string }
}) {
    const { action } = params;
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusChangeReason, setStatusChangeReason] = useState("");
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showStatusHistory, setShowStatusHistory] = useState(false);

    const isEditing = action !== 'new';
    const projectId = isEditing ? action : null;

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            image: "",
            gallery: [],
            tags: [],
            category: "",
            url: "",
            client: "",
            year: new Date().getFullYear().toString(),
            isPaid: false,
            price: undefined,
            previewFeatures: [],
            liveUrl: "",
            videoUrl: "",
            githubUrl: "",
            status: "active",
            statusHistory: [],
            content: "",
        },
    });

    useEffect(() => {
        const fetchProject = async () => {
            if (!isEditing) return;

            try {
                console.log('Fetching project:', action); // Debug log
                const response = await fetch(`/api/admin/projects/${action}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }

                const data = await response.json();
                console.log('Fetched project data:', data); // Debug log

                // Ensure content is included in the form data and default to empty string
                form.reset({
                    ...data,
                    content: data.content || "", // Ensure content is set from fetched data or defaults to ""
                });
            } catch (error) {
                console.error('Error fetching project:', error);
                toast.error('Failed to fetch project data');
                router.push('/admin/projects');
            } finally {
                setIsLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchProject();
        } else if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [isEditing, action, router, form, status]);

    const onSubmit = async (data: ProjectFormValues) => {
        try {
            setIsSubmitting(true);
            setError(null);

            console.log('Submitting form with data:', data); // Debug log

            const formData = {
                ...data,
                tags: data.tags.filter(tag => tag.trim() !== ''),
                gallery: data.gallery?.filter(url => url.trim() !== '') || [],
                previewFeatures: data.previewFeatures?.filter(feature => feature.trim() !== '') || [],
                content: data.content || "", // Ensure content is included
            };

            const url = isEditing ? `/api/admin/projects/${action}` : '/api/admin/projects';
            console.log('Submitting to URL:', url); // Debug log

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            console.log('Response status:', response.status); // Debug log
            console.log('Response headers:', response.headers); // Debug log

            if (!response.ok) {
                console.error('HTTP Error Response:', response);
                try {
                    const errorData = await response.json();
                    console.error('HTTP Error Body (JSON):', errorData);
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                } catch (jsonError) {
                    console.error('Failed to parse JSON error body:', jsonError);
                    const textError = await response.text();
                    console.error('HTTP Error Body (Text):', textError);
                    throw new Error(`HTTP error! status: ${response.status}. Body: ${textError.substring(0, 100)}...`); // Include first 100 chars of text body
                }
            }

            const result = await response.json();
            console.log('Update result:', result); // Debug log

            toast.success(`Project ${isEditing ? 'updated' : 'created'} successfully`);
            router.push('/admin/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            setUploadStatus('uploading');
            setError(null);

            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image must be less than 5MB');
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const data = await response.json();
            form.setValue('image', data.url);
            setUploadStatus('success');
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');

            if (isAuthError(error)) {
                toast.error('Please sign in to upload images');
                router.push('/auth/signin');
                return;
            }

            if (isRateLimitError(error)) {
                toast.error('Too many uploads. Please try again later.');
                return;
            }

            toast.error(error instanceof Error ? error.message : 'Failed to upload image');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            if (!isEditing || !action) {
                toast.error('Cannot update status: Invalid project ID');
                return;
            }

            console.log('Updating status for project:', action); // Debug log

            const response = await fetch(`/api/admin/projects/${action}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    reason: statusChangeReason,
                }),
            });

            console.log('Status update response:', response.status); // Debug log

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            const data = await response.json();
            console.log('Status update result:', data); // Debug log

            form.reset(data);
            toast.success('Project status updated successfully');
            setStatusChangeReason("");
        } catch (error) {
            console.error('Error updating status:', error);

            if (isAuthError(error)) {
                toast.error('Please sign in to update project status');
                router.push('/auth/signin');
                return;
            }

            if (isRateLimitError(error)) {
                toast.error('Too many requests. Please try again later.');
                return;
            }

            toast.error(getErrorMessage(error));
        }
    };

    const ErrorMessage = ({ message }: { message: string }) => (
        <p className="text-sm text-red-500 mt-1">{message}</p>
    );

    if (status === 'loading' || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loading size="lg" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/projects">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">
                    {isEditing ? 'Edit Project' : 'New Project'}
                </h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                        {isEditing ? 'Update the project information below.' : 'Fill in the project information below.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter project title" {...field} disabled={isSubmitting} className={form.formState.errors.title ? 'border-red-500' : ''} />
                                            </FormControl>
                                            {form.formState.errors.title && (
                                                <ErrorMessage message={form.formState.errors.title.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isSubmitting}
                                                >
                                                    <SelectTrigger className={form.formState.errors.category ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category} value={category}>
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            {form.formState.errors.category && (
                                                <ErrorMessage message={form.formState.errors.category.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter project description"
                                                className={`min-h-[100px] ${form.formState.errors.description ? 'border-red-500' : ''}`}
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        {form.formState.errors.description && (
                                            <ErrorMessage message={form.formState.errors.description.message as string} />
                                        )}
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="client"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter client name" {...field} disabled={isSubmitting} className={form.formState.errors.client ? 'border-red-500' : ''} />
                                            </FormControl>
                                            {form.formState.errors.client && (
                                                <ErrorMessage message={form.formState.errors.client.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="YYYY"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value.length <= 4) {
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                    disabled={isSubmitting}
                                                    className={form.formState.errors.year ? 'border-red-500' : ''}
                                                />
                                            </FormControl>
                                            {form.formState.errors.year && (
                                                <ErrorMessage message={form.formState.errors.year.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleStatusChange(value);
                                                }}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        {form.formState.errors.status && (
                                            <ErrorMessage message={form.formState.errors.status.message as string} />
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter project content"
                                                className={`min-h-[200px] ${form.formState.errors.content ? 'border-red-500' : ''}`}
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        {form.formState.errors.content && (
                                            <ErrorMessage message={form.formState.errors.content.message as string} />
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Image</FormLabel>
                                        <FormControl>
                                            <div>
                                                <div className="space-y-4">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={uploadStatus === 'uploading' || isSubmitting}
                                                                className="w-full"
                                                            >
                                                                {uploadStatus === 'uploading' ? (
                                                                    <>
                                                                        <Loading size="sm" className="mr-2" />
                                                                        Uploading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="mr-2 h-4 w-4" />
                                                                        {field.value ? 'Change Image' : 'Upload Project Image'}
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                ref={fileInputRef}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleFileUpload(file);
                                                                }}
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                        {field.value && (
                                                            <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                                                                <img
                                                                    src={field.value}
                                                                    alt="Project preview"
                                                                    className="object-cover w-full h-full"
                                                                    priority={true}
                                                                    onError={() => {
                                                                        toast.error("Could not load image. Please try uploading again.");
                                                                        field.onChange("");
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => field.onChange("")}
                                                                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {form.formState.errors.image && (
                                                    <ErrorMessage message={form.formState.errors.image.message as string} />
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Upload a project image (max 5MB, JPG, PNG, or GIF)
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com/project"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={form.formState.errors.url ? 'border-red-500' : ''}
                                                />
                                            </FormControl>
                                            {form.formState.errors.url && (
                                                <ErrorMessage message={form.formState.errors.url.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="liveUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Live URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={form.formState.errors.liveUrl ? 'border-red-500' : ''}
                                                />
                                            </FormControl>
                                            {form.formState.errors.liveUrl && (
                                                <ErrorMessage message={form.formState.errors.liveUrl.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="videoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Demo Video URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={form.formState.errors.videoUrl ? 'border-red-500' : ''}
                                                />
                                            </FormControl>
                                            {form.formState.errors.videoUrl && (
                                                <ErrorMessage message={form.formState.errors.videoUrl.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="githubUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GitHub URL (Optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://github.com/username/repo"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className={form.formState.errors.githubUrl ? 'border-red-500' : ''}
                                                />
                                            </FormControl>
                                            {form.formState.errors.githubUrl && (
                                                <ErrorMessage message={form.formState.errors.githubUrl.message as string} />
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Project Status</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowStatusHistory(!showStatusHistory)}
                                    >
                                        {showStatusHistory ? 'Hide History' : 'Show History'}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Current Status</FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            handleStatusChange(value);
                                                        }}
                                                        disabled={isSubmitting}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="draft">Draft</SelectItem>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="archived">Archived</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {form.formState.errors.status && (
                                                        <ErrorMessage message={form.formState.errors.status.message as string} />
                                                    )}
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="statusReason">Status Change Reason (Optional)</Label>
                                        <Input
                                            id="statusReason"
                                            value={statusChangeReason}
                                            onChange={(e) => setStatusChangeReason(e.target.value)}
                                            placeholder="Why is the status changing?"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {showStatusHistory && (
                                    <div className="mt-4 space-y-4">
                                        <h4 className="text-sm font-medium">Status History</h4>
                                        <div className="space-y-2">
                                            {form.watch('statusHistory')?.map((entry, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={
                                                                entry.status === 'active' ? 'default' :
                                                                    entry.status === 'completed' ? 'secondary' :
                                                                        entry.status === 'archived' ? 'secondary' :
                                                                            'outline'
                                                            }>
                                                                {entry.status}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">
                                                                by {entry.changedBy}
                                                            </span>
                                                        </div>
                                                        {entry.reason && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Reason: {entry.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {format(new Date(entry.changedAt), 'PPp')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/projects')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isEditing ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        isEditing ? 'Update Project' : 'Create Project'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 