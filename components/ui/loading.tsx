'use client';

import { cn } from "@/lib/utils";

interface LoadingProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
}

export function Loading({ className, size = 'md', fullScreen = false }: LoadingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    const spinner = (
        <div className={cn(
            "animate-spin rounded-full border-2 border-current border-t-transparent",
            sizeClasses[size],
            className
        )} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
} 