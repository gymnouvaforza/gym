import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      {/* Resumen de Operación */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border border-black/5 bg-white p-6 shadow-sm"
            >
              <Skeleton className="h-2 w-20" />
              <Skeleton className="mt-4 h-8 w-24" />
              <Skeleton className="mt-2 h-2 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid de Contenido Principal */}
      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="border border-black/5 bg-white shadow-sm">
            <div className="border-b border-black/5 p-6">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="divide-y divide-black/5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-6">
                  <Skeleton className="h-10 w-10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-2 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="border border-black/5 bg-white p-6 shadow-sm">
            <Skeleton className="h-40 w-full" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          </div>
          <div className="border border-black/5 bg-[#111111] p-6 shadow-sm">
            <Skeleton className="h-4 w-24 bg-white/10" />
            <Skeleton className="mt-4 h-12 w-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
