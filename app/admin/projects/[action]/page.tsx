'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { clientDb } from '@/firebase/clientApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProjectFormData {
    title: string;
    description: string;
    status: 'active' | 'completed' | 'archived';
    content: string;
    imageUrl?: string;
}

export default function ProjectFormPage({
    params
}: {
    params: { action: string }
}) {
    const router = useRouter();
    const isEditing = params.action !== 'new';
    const projectId = isEditing ? params.action : null;
    const [loading, setLoading] = useState(isEditing);
    const [formData, setFormData] = useState<ProjectFormData>({
        title: '',
        description: '',
        status: 'active',
        content: '',
        imageUrl: ''
    });

    useEffect(() => {
        const fetchProject = async () => {
            if (!isEditing) return;

            try {
                const projectRef = doc(clientDb, 'projects', projectId!);
                const projectSnap = await getDoc(projectRef);

                if (projectSnap.exists()) {
                    setFormData(projectSnap.data() as ProjectFormData);
                } else {
                    toast.error('Project not found');
                    router.push('/admin/projects');
                }
            } catch (error) {
                console.error('Error fetching project:', error);
                toast.error('Failed to fetch project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [isEditing, projectId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const projectData = {
                ...formData,
                updatedAt: serverTimestamp(),
            };

            if (isEditing) {
                await setDoc(doc(clientDb, 'projects', projectId!), projectData);
                toast.success('Project updated successfully');
            } else {
                projectData.createdAt = serverTimestamp();
                await addDoc(collection(clientDb, 'projects'), projectData);
                toast.success('Project created successfully');
            }

            router.push('/admin/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error(isEditing ? 'Failed to update project' : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
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

            <Card>
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>
                        {isEditing ? 'Update the project information below.' : 'Fill in the project information below.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: ProjectFormData['status']) =>
                                    setFormData({ ...formData, status: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-[200px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL (optional)</Label>
                            <Input
                                id="imageUrl"
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/admin/projects')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 