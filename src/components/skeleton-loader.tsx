
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonLoader() {
  return (
    <main className="min-h-screen bg-secondary lg:grid lg:grid-cols-5 lg:h-screen lg:overflow-y-hidden">
      {/* --- Left Panel Skeleton --- */}
      <div className="bg-background lg:col-span-2 lg:overflow-y-auto custom-scrollbar">
        <div className="p-6 sm:p-8 lg:p-10">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-8 w-32" />
            </div>
          </header>

          <div className="space-y-8">
             {/* Progress Bar Skeleton */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <Skeleton className="h-1 w-full rounded-full" />
                    <Skeleton className="h-1 w-full rounded-full" />
                    <Skeleton className="h-1 w-full rounded-full" />
                    <Skeleton className="h-1 w-full rounded-full" />
                    <Skeleton className="h-1 w-full rounded-full" />
                </div>
                <Skeleton className="h-8 w-48 mx-auto" />
            </div>

            <div className="space-y-4 pt-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-4 pt-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-4 pt-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Panel Skeleton --- */}
      <div className="hidden lg:flex lg:col-span-3 flex-col items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden bg-secondary">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="w-full aspect-[1050/600] rounded-2xl" />
        </div>
      </div>
    </main>
  )
}
