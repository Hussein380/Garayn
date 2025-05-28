'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
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
import { X, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().min(1, "Description is required").max(500, "Description is too long"),
    image: z.string().url("Must be a valid URL").min(1, "Main image is required"),
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
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ImageUpload {
    file: File;
    preview: string;
    crop: Crop;
}

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

export default function NewProjectPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [newFeature, setNewFeature] = useState("");
    const [mainImage, setMainImage] = useState<ImageUpload | null>(null);
    const [galleryImages, setGalleryImages] = useState<ImageUpload[]>([]);
    const [showCropDialog, setShowCropDialog] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

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

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Compress image before showing crop dialog
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            const imageUrl = URL.createObjectURL(compressedFile);
            const imageUpload: ImageUpload = {
                file: compressedFile,
                preview: imageUrl,
                crop: {
                    unit: '%',
                    width: 100,
                    height: 100,
                    x: 0,
                    y: 0,
                },
            };

            if (isGallery) {
                setGalleryImages([...galleryImages, imageUpload]);
                setCurrentImageIndex(galleryImages.length);
            } else {
                setMainImage(imageUpload);
                setCurrentImageIndex(null);
            }
            setShowCropDialog(true);
        } catch (error) {
            console.error('Error processing image:', error);
            toast.error('Failed to process image');
        }
    };

    const handleCropComplete = async (crop: Crop) => {
        if (!imageRef.current) return;

        const currentImage = currentImageIndex === null ? mainImage : galleryImages[currentImageIndex];
        if (!currentImage) return;

        try {
            const croppedImage = await getCroppedImg(
                imageRef.current,
                crop,
                currentImage.file.name
            );

            if (currentImageIndex === null) {
                setMainImage({ ...currentImage, crop, file: croppedImage.file, preview: croppedImage.preview });
            } else {
                const newGallery = [...galleryImages];
                newGallery[currentImageIndex] = { ...currentImage, crop, file: croppedImage.file, preview: croppedImage.preview };
                setGalleryImages(newGallery);
            }

            setShowCropDialog(false);
        } catch (error) {
            console.error('Error cropping image:', error);
            toast.error('Failed to crop image');
        }
    };

    const uploadImage = async (imageUpload: ImageUpload): Promise<string> => {
        const formData = new FormData();
        formData.append('file', imageUpload.file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        return data.url;
    };

    const onSubmit = async (data: ProjectFormValues) => {
        try {
            setIsSubmitting(true);
            setIsUploading(true);

            // Upload main image
            if (mainImage) {
                const mainImageUrl = await uploadImage(mainImage);
                data.image = mainImageUrl;
            }

            // Upload gallery images
            if (galleryImages.length > 0) {
                const galleryUrls = await Promise.all(
                    galleryImages.map(image => uploadImage(image))
                );
                data.gallery = galleryUrls;
            }

            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create project");
            }

            toast.success("Project created successfully");
            router.push("/admin/projects");
        } catch (error) {
            console.error("Error creating project:", error);
            toast.error("Failed to create project");
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
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

    const removeGalleryImage = (index: number) => {
        setGalleryImages(galleryImages.filter((_, i) => i !== index));
    };

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
                                        <FormLabel>Main Project Image</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageSelect(e, false)}
                                                        disabled={isUploading}
                                                        className="flex-1"
                                                    />
                                                    {isUploading && (
                                                        <Loading size="sm" />
                                                    )}
                                                </div>
                                                {mainImage && (
                                                    <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                                                        <img
                                                            src={mainImage.preview}
                                                            alt="Project preview"
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setMainImage(null)}
                                                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                <Input
                                                    type="hidden"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Upload a main project image (max 5MB, JPG, PNG, or GIF)
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
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageSelect(e, true)}
                                                        disabled={isUploading}
                                                        className="flex-1"
                                                    />
                                                    {isUploading && (
                                                        <Loading size="sm" />
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {galleryImages.map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative aspect-square rounded-lg overflow-hidden border"
                                                        >
                                                            <img
                                                                src={image.preview}
                                                                alt={`Gallery image ${index + 1}`}
                                                                className="object-cover w-full h-full"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryImage(index)}
                                                                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Add additional images to the project gallery (max 5MB each)
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

            <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {((currentImageIndex === null && mainImage) || (currentImageIndex !== null && galleryImages[currentImageIndex])) && (
                            <ReactCrop
                                crop={currentImageIndex === null ? mainImage!.crop : galleryImages[currentImageIndex].crop}
                                onChange={(c) => {
                                    if (currentImageIndex === null) {
                                        setMainImage({ ...mainImage!, crop: c });
                                    } else {
                                        const newGallery = [...galleryImages];
                                        newGallery[currentImageIndex] = { ...newGallery[currentImageIndex], crop: c };
                                        setGalleryImages(newGallery);
                                    }
                                }}
                                onComplete={handleCropComplete}
                                aspect={16 / 9}
                            >
                                <img
                                    ref={imageRef}
                                    src={currentImageIndex === null ? mainImage!.preview : galleryImages[currentImageIndex].preview}
                                    alt="Crop preview"
                                    className="max-h-[60vh] w-auto"
                                />
                            </ReactCrop>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Helper function to get cropped image
function getCroppedImg(
    image: HTMLImageElement,
    crop: Crop,
    fileName: string
): Promise<{ file: File; preview: string }> {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                const preview = URL.createObjectURL(blob);
                resolve({ file, preview });
            },
            'image/jpeg',
            0.95
        );
    });
} 