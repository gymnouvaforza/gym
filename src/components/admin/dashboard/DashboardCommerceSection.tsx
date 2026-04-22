import { ShoppingBag, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { buildCommerceMetrics } from "@/lib/admin-dashboard";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import { getStoreAdminSnapshot } from "@/lib/data/store-admin";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import { SectionSkeleton } from "@/components/ui/loading-state";

export function DashboardCommerceSectionFallback() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse bg-black/10 rounded-md" />
          <div className="h-8 w-40 animate-pulse bg-black/5 rounded-md" />
        </div>
        <div className="h-4 w-36 animate-pulse bg-black/5 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} lines={3} className="min-h-[150px]" />
        ))}
      </div>
    </section>
  );
}

export default async function DashboardCommerceSection({
  activeModulesPromise,
}: {
  activeModulesPromise: Promise<SystemModuleStateMap>;
}) {
  const [storeSnapshot, activeModules] = await Promise.all([
    getStoreAdminSnapshot(),
    activeModulesPromise,
  ]);

  if (!activeModules.tienda) {
    return null;
  }

  const commerceMetrics = buildCommerceMetrics(storeSnapshot.products, storeSnapshot.source, {
    warning: storeSnapshot.warning,
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#111111] rounded-md text-white shadow-sm">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#111111] uppercase">
            Commerce
          </h2>
        </div>
        <Link
          href="/dashboard/tienda"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7a7f87] transition-colors hover:text-[#111111]"
        >
          Gestionar catalogo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {commerceMetrics.map((metric) => (
          <AdminMetricCard 
            key={metric.label} 
            {...metric} 
            className="border-none shadow-md transition-all hover:shadow-lg rounded-xl overflow-hidden" 
          />
        ))}
      </div>
    </section>
  );
}
