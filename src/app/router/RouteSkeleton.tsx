import { Skeleton } from '@/shared/ui/Skeleton';

/** Suspense fallback while a route chunk or its translations load — a skeleton, never a full-page spinner. */
export function RouteSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80" />
      <Skeleton className="h-8 w-full max-w-3xl" />
      <Skeleton className="min-h-72 w-full flex-1" />
    </div>
  );
}
