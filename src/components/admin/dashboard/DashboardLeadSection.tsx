import { Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { countLeadsByStatus, buildDashboardMetrics } from "@/lib/admin-dashboard";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import { getDashboardData } from "@/lib/data/site";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSurface from "@/components/admin/AdminSurface";
import { SectionSkeleton } from "@/components/ui/loading-state";

export function DashboardLeadSectionFallback() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse bg-[#d71920]/20 rounded-md" />
          <div className="h-8 w-40 animate-pulse bg-black/5 rounded-md" />
        </div>
        <div className="h-4 w-32 animate-pulse bg-black/5 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} lines={3} className="min-h-[150px]" />
        ))}
      </div>
      <SectionSkeleton lines={4} className="min-h-[140px]" />
    </section>
  );
}

export default async function DashboardLeadSection({
  activeModulesPromise,
}: {
  activeModulesPromise: Promise<SystemModuleStateMap>;
}) {
  const [{ leads }, activeModules] = await Promise.all([
    getDashboardData(),
    activeModulesPromise,
  ]);

  if (!activeModules.leads) {
    return null;
  }

  const leadSummary = countLeadsByStatus(leads);
  const newLeads = leadSummary.new;
  const leadMetrics = buildDashboardMetrics(leads, newLeads);
  const processedRatio =
    leads.length > 0 ? Math.round(((leadSummary.contacted + leadSummary.closed) / leads.length) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#d71920] rounded-md text-white shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#111111] uppercase">
            Captacion
          </h2>
        </div>
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7a7f87] transition-colors hover:text-[#d71920]"
        >
          Ver embudo completo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {leadMetrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            {...metric}
            className="border-none shadow-md transition-all hover:shadow-lg rounded-xl overflow-hidden"
          />
        ))}
      </div>

      <AdminSurface inset className="border-l-4 border-l-[#d71920] p-6 rounded-r-xl border-[0.5px] border-t-black/5 border-r-black/5 border-b-black/5">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#111111]">
              Eficiencia del embudo
            </p>
            <p className="text-sm leading-relaxed text-[#5f6368]">
              De los <span className="font-bold text-[#111111]">{leads.length}</span> contactos totales,
              un <span className="font-bold text-[#d71920]"> {processedRatio}% </span>
              ha sido procesado por el equipo comercial.
            </p>
          </div>
        </div>
      </AdminSurface>
    </section>
  );
}
