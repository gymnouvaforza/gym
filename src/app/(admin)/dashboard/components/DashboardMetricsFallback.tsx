import { SectionSkeleton } from "@/components/ui/loading-state";

export default function DashboardMetricsFallback() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-black/5 p-4 rounded-xl shadow-sm"
        >
          <SectionSkeleton lines={2} />
        </div>
      ))}
    </div>
  );
}
