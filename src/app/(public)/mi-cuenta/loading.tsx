import { SectionSkeleton } from "@/components/ui/loading-state";

export default function MemberAccountLoading() {
  return (
    <main className="min-h-screen bg-[#fbfbf8] pb-12">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#111111] px-4 lg:h-20 lg:px-12">
        <div className="space-y-2">
          <div className="h-2 w-24 animate-pulse bg-white/20" />
          <div className="h-3 w-40 animate-pulse bg-white/10" />
        </div>
        <div className="h-10 w-28 animate-pulse border border-white/10 bg-white/5" />
      </header>

      <div className="mx-auto max-w-[1200px] px-3 py-6 lg:px-8 lg:py-12">
        <div className="grid gap-6">
          <div className="rounded-none border border-black/8 bg-white p-6 shadow-sm">
            <div className="h-3 w-28 animate-pulse bg-black/6" />
            <div className="mt-4 h-12 w-64 animate-pulse bg-black/6 sm:w-96" />
            <div className="mt-3 h-3 w-56 animate-pulse bg-black/6" />
          </div>

          <div className="overflow-hidden rounded-none border border-black/8 bg-white shadow-sm">
            <div className="flex gap-2 border-b border-black/5 p-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-11 w-24 animate-pulse bg-black/6 sm:w-32" />
              ))}
            </div>
            <div className="grid gap-6 p-4 lg:grid-cols-[1.2fr_0.8fr] lg:p-6">
              <SectionSkeleton lines={6} />
              <SectionSkeleton lines={5} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
