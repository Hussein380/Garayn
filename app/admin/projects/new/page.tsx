'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Trash2, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().min(1, "Description is required").max(500, "Description is too long"),
    image: z.string().min(1, "Project image is required"),
    gallery: z.array(z.string()).optional(),
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

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function NewProjectPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mainImageUrl, setMainImageUrl] = useState("");
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [newFeature, setNewFeature] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

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
        },
    });

    const isPaid = form.watch("isPaid");

    const onSubmit = async (data: ProjectFormValues) => {
        try {
            setIsSubmitting(true);

            const response = await fetch('/api/admin/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            toast.success('Project created successfully');
            router.push('/admin/projects');
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeGalleryUrl = (url: string) => {
        const newUrls = galleryUrls.filter(u => u !== url);
        setGalleryUrls(newUrls);
        form.setValue("gallery", newUrls);
    };

    const addTag = () => {
        if (!newTag.trim()) return;

        const currentTags = form.getValues("tags");
        if (!currentTags.includes(newTag.trim())) {
            form.setValue("tags", [...currentTags, newTag.trim()]);
        }
        setNewTag("");
    };

    const removeTag = (tag: string) => {
        const currentTags = form.getValues("tags");
        form.setValue(
            "tags",
            currentTags.filter((t) => t !== tag)
        );
    };

    const addFeature = () => {
        if (!newFeature.trim()) return;

        const currentFeatures = form.getValues("previewFeatures") || [];
        if (!currentFeatures.includes(newFeature.trim())) {
            form.setValue("previewFeatures", [...currentFeatures, newFeature.trim()]);
        }
        setNewFeature("");
    };

    const removeFeature = (feature: string) => {
        const currentFeatures = form.getValues("previewFeatures") || [];
        form.setValue(
            "previewFeatures",
            currentFeatures.filter((f) => f !== feature)
        );
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG, PNG, or GIF)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        try {
            setUploadStatus('uploading');
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            if (!data.url) {
                throw new Error('No URL returned from upload');
            }

            form.setValue('image', data.url);
            setMainImageUrl(data.url);
            setUploadStatus('success');
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            if (error instanceof Error) {
                toast.error(`Failed to upload image: ${error.message}`);
            } else {
                toast.error('Failed to upload image. Please try again.');
            }
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleGalleryUpload = async (file: File) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG, PNG, or GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            if (!data.url) {
                throw new Error('No URL returned from upload');
            }

            setGalleryUrls([...galleryUrls, data.url]);
            form.setValue("gallery", [...galleryUrls, data.url]);
            toast.success('Image added to gallery');
        } catch (error) {
            console.error('Upload error:', error);
            if (error instanceof Error) {
                toast.error(`Failed to upload image: ${error.message}`);
            } else {
                toast.error('Failed to upload image. Please try again.');
            }
            // Clear the file input
            if (galleryInputRef.current) {
                galleryInputRef.current.value = '';
            }
        }
    };

    const galleryInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">New Project</h1>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
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
                                                <Input placeholder="Enter project title" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
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
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
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
                                                <Input placeholder="Enter client name" {...field} />
                                            </FormControl>
                                            <FormMessage />
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
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Image</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={uploadStatus === 'uploading'}
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
                                                                    {mainImageUrl ? 'Change Image' : 'Upload Project Image'}
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
                                                        />
                                                    </div>
                                                    {mainImageUrl && (
                                                        <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                                                            <img
                                                                src={mainImageUrl}
                                                                alt="Project preview"
                                                                className="object-cover w-full h-full"
                                                                onError={() => {
                                                                    toast.error("Could not load image. Please try uploading again.");
                                                                    setMainImageUrl("");
                                                                    field.onChange("");
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setMainImageUrl("");
                                                                    field.onChange("");
                                                                }}
                                                                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Upload a project image (max 5MB, JPG, PNG, or GIF)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gallery"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Gallery Images</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => galleryInputRef.current?.click()}
                                                            className="w-full"
                                                        >
                                                            <Upload className="mr-2 h-4 w-4" />
                                                            Add Gallery Image
                                                        </Button>
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            ref={galleryInputRef}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleGalleryUpload(file);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                        {galleryUrls.map((url, index) => (
                                                            <div
                                                                key={index}
                                                                className="relative aspect-square rounded-lg overflow-hidden border group"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`Gallery image ${index + 1}`}
                                                                    className="object-cover w-full h-full"
                                                                    onError={() => {
                                                                        toast.error("Could not load image");
                                                                        removeGalleryUrl(url);
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeGalleryUrl(url)}
                                                                        className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                                                    >
                                                                        <Trash2 className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Add multiple images to your project gallery (max 5MB each, JPG, PNG, or GIF)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tags"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Tags</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add a tag"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                addTag();
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={addTag}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {form.watch("tags").map((tag) => (
                                                        <div
                                                            key={tag}
                                                            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                                        >
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(tag)}
                                                                className="hover:text-destructive"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
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
                                                />
                                            </FormControl>
                                            <FormMessage />
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
                                                />
                                            </FormControl>
                                            <FormMessage />
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
                                                />
                                            </FormControl>
                                            <FormMessage />
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
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isPaid"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Paid Project</FormLabel>
                                            <FormDescription>
                                                Enable if this is a paid project
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {isPaid && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price ($)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Enter price"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="previewFeatures"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Preview Features</FormLabel>
                                                <FormDescription>
                                                    List the key features included in this project
                                                </FormDescription>
                                                <FormControl>
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Add a feature"
                                                                value={newFeature}
                                                                onChange={(e) => setNewFeature(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        addFeature();
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={addFeature}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {form.watch("previewFeatures")?.map((feature) => (
                                                                <div
                                                                    key={feature}
                                                                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                                                >
                                                                    {feature}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFeature(feature)}
                                                                        className="hover:text-destructive"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loading size="sm" className="mr-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Project"
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