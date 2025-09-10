
"use client"

import { Suspense } from 'react';
import ModernImageSlider from '@/components/modern-image-slider';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

function GalleryContent() {
    const searchParams = useSearchParams();
    const imagesParam = searchParams.get('images');
    const logoParam = searchParams.get('logo');

    const images = imagesParam ? imagesParam.split(',') : [];
    const logo = logoParam || undefined;

    if (!images.length) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-secondary text-center p-4">
                <h1 className="text-2xl font-bold mb-2">No Images Found</h1>
                <p className="text-muted-foreground">The gallery link appears to be incomplete.</p>
            </div>
        )
    }

    return <ModernImageSlider images={images} companyLogo={logo} />;
}


function GallerySkeleton() {
    return (
        <div className="relative w-full max-w-6xl mx-auto bg-black/80 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-3 h-3 rounded-full" />
            </div>
        </div>
    )
}

export default function GalleryPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
        <Suspense fallback={<GallerySkeleton />}>
            <GalleryContent />
        </Suspense>
    </div>
  );
}
