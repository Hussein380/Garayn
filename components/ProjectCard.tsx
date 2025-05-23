import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export type Project = {
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
};

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <div className="glass-effect rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 theme-transition relative">
            {/* For Sale Badge */}
            {project.isPaid && (
                <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-green-600 text-white">For Sale</Badge>
                </div>
            )}
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Watch Demo Button (always present, disabled if no videoUrl) */}
                <a
                    href={project.videoUrl || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute bottom-4 left-4 z-20 px-4 py-2 rounded-full shadow-lg transition font-semibold text-white ${project.videoUrl ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed pointer-events-none"}`}
                    onClick={e => { if (!project.videoUrl) e.preventDefault(); e.stopPropagation(); }}
                >
                    Watch Demo
                </a>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    {project.isPaid ? (
                        <Badge className="bg-primary text-primary-foreground">
                            ${project.price}
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Free</Badge>
                    )}
                </div>
                {/* External link button */}
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-4 right-4 bg-primary/90 hover:bg-primary text-white p-2 rounded-full inline-flex items-center justify-center z-20"
                        onClick={e => e.stopPropagation()}
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {project.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{project.year}</span>
                </div>
                <h2 className="text-xl font-bold mb-2">{project.title}</h2>
                <p className="text-muted-foreground mb-4 flex-grow">{project.description}</p>
                {project.isPaid && project.previewFeatures && (
                    <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Includes:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {project.previewFeatures.slice(0, 2).map((feature, i) => (
                                <li key={i} className="flex items-center">
                                    <span className="mr-2">•</span>
                                    {feature}
                                </li>
                            ))}
                            {project.previewFeatures.length > 2 && (
                                <li className="text-primary">+{project.previewFeatures.length - 2} more</li>
                            )}
                        </ul>
                    </div>
                )}
                <div className="mt-auto">
                    <div className="text-sm text-muted-foreground mb-3">Client: {project.client}</div>
                    <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                                {tag}
                            </span>
                        ))}
                        {project.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                                +{project.tags.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
                {/* Action Button */}
                <div className="mt-4">
                    {project.isPaid ? (
                        <Button className="w-full" variant="default">
                            Purchase Project
                        </Button>
                    ) : (
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={project.url}>View Details</Link>
                        </Button>
                    )}
                </div>
            </div>
            {/* Make the entire card clickable except for the purchase button */}
            <Link href={project.url} className="absolute inset-0 z-10 focus:outline-none" aria-hidden="true">
                <span className="sr-only">View {project.title} details</span>
            </Link>
        </div>
    );
} 