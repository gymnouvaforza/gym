import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden border border-black/5 bg-white">
      <Skeleton className="aspect-square bg-black/[0.03]" />
      <div className="space-y-4 p-6 md:p-8">
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-8 w-5/6" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/5 pt-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-28" />
        </div>
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <section className="section-shell py-12 md:py-20">
      <div className="border border-black/8 bg-white p-8 md:p-12">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 bg-[#d71920]" />
          <Skeleton className="h-2 w-32" />
        </div>
        <Skeleton className="mt-6 h-12 w-64 md:h-16 md:w-96" />
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[300px_1fr] lg:items-start">
        <div className="hidden border border-black/8 bg-white p-8 lg:block">
          <Skeleton className="h-4 w-24" />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
          <div className="mt-10 pt-10 border-t border-black/5">
            <Skeleton className="h-4 w-20" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
