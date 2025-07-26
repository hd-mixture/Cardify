
import { Skeleton } from "@/components/ui/skeleton"

export function WelcomeSkeleton() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center p-4">
            <Skeleton className="mb-8 w-16 h-16 rounded-2xl" />
            <Skeleton className="h-12 w-80 mb-4" />
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-5 w-96" />
                <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-11 w-40 mt-10" />
        </div>
    </div>
  )
}
