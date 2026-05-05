import { Suspense, cache } from "react";
import { Activity } from "lucide-react";

import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import DashboardNotice from "@/components/admin/DashboardNotice";
import { SectionSkeleton } from "@/components/ui/loading-state";

import DashboardLeadSection, { DashboardLeadSectionFallback } from "@/components/admin/dashboard/DashboardLeadSection";
import DashboardCommerceSection, { DashboardCommerceSectionFallback } from "@/components/admin/dashboard/DashboardCommerceSection";
import DashboardQuickAccess from "@/components/admin/dashboard/DashboardQuickAccess";
import DashboardOverviewAlerts from "@/components/admin/dashboard/DashboardOverviewAlerts";
import DashboardMetrics from "./components/DashboardMetrics";
import DashboardMetricsFallback from "./components/DashboardMetricsFallback";
import { getActiveModules } from "@/lib/data/modules";
import { getDashboardData } from "@/lib/data/site";
import { getStoreAdminSnapshot } from "@/lib/data/store-admin";

const getDashboardDataCached = cache(async () => getDashboardData());
const getStoreSnapshotCached = cache(async () => getStoreAdminSnapshot());

async function DashboardWarnings() {
  const [{ warning }, storeSnapshot] = await Promise.all([
    getDashboardDataCached(),
    getStoreSnapshotCached(),
  ]);

  if (!warning && !storeSnapshot.warning) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      {warning ? <DashboardNotice message={warning} tone="warning" /> : null}
      {storeSnapshot.warning ? <DashboardNotice message={storeSnapshot.warning} tone="info" /> : null}
    </div>
  );
}

export default function DashboardPage() {
  const activeModulesPromise = getActiveModules();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] w-full">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <DashboardPageHeader
          title="COMMAND CENTER"
          description="Monitoreo en tiempo real de la operacion, captacion y salud comercial del club."
          icon={Activity}
          eyebrow="Dashboard v2.0"
          className="pb-0"
        />
        <div className="flex items-center gap-4 bg-white p-3 shadow-sm rounded-xl border border-black/5">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
              Status Global
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Operativo - Online
            </p>
          </div>
          <div className="h-10 w-1 bg-green-500 rounded-full" />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-2">
            <SectionSkeleton lines={2} />
          </div>
        }
      >
        <DashboardWarnings />
      </Suspense>

      <Suspense fallback={<DashboardMetricsFallback />}>
        <DashboardMetrics />
      </Suspense>

      <Suspense fallback={<SectionSkeleton lines={4} />}>
         <DashboardOverviewAlerts activeModulesPromise={activeModulesPromise} />
      </Suspense>

      <DashboardQuickAccess />

      <div className="space-y-12">
        <Suspense fallback={<DashboardLeadSectionFallback />}>
          <DashboardLeadSection activeModulesPromise={activeModulesPromise} />
        </Suspense>
        <Suspense fallback={<DashboardCommerceSectionFallback />}>
          <DashboardCommerceSection activeModulesPromise={activeModulesPromise} />
        </Suspense>
      </div>
    </div>
  );
}
