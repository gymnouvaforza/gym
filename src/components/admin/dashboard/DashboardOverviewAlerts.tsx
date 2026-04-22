import Link from "next/link";
import { ShoppingBag, Users, Activity } from "lucide-react";
import { countLeadsByStatus, getCommerceSourceMeta, getTopbarStatusMeta } from "@/lib/admin-dashboard";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import { getDashboardData } from "@/lib/data/site";
import { getStoreAdminSnapshot } from "@/lib/data/store-admin";
import { resolveTopbarStatus } from "@/lib/topbar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardOverviewAlerts({
  activeModulesPromise,
}: {
  activeModulesPromise: Promise<SystemModuleStateMap>;
}) {
  const [{ settings, leads, teamMembers }, storeSnapshot, activeModules] = await Promise.all([
    getDashboardData(),
    getStoreAdminSnapshot(),
    activeModulesPromise,
  ]);

  const leadSummary = countLeadsByStatus(leads);
  const newLeads = leadSummary.new;
  const topbarMeta = getTopbarStatusMeta(resolveTopbarStatus(settings));
  const commerceMeta = getCommerceSourceMeta(storeSnapshot.source, {
    warning: storeSnapshot.warning,
  });

  return (
    <div className="space-y-6 mb-10">
      {/* ALERTS SECTION */}
      {activeModules.leads && newLeads > 0 && (
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-[#d71920] bg-red-50 p-5 rounded-r-xl shadow-sm">
           <div>
             <p className="text-xs font-bold uppercase tracking-widest text-[#d71920] mb-1">
               Atencion Requerida
             </p>
             <p className="text-sm font-medium text-[#111111]">
               Tienes <span className="font-bold text-[#d71920]">{newLeads} leads nuevos</span> esperando respuesta.
               La velocidad de contacto define el cierre.
             </p>
           </div>
           <Link
             href="/dashboard/leads"
             className="shrink-0 inline-flex items-center justify-center bg-[#d71920] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#111111] rounded-md"
           >
             Atender Leads
           </Link>
         </div>
      )}

      {/* QUICK STATUS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marketing Status */}
        <div className="flex items-center justify-between border border-black/5 bg-white p-4 rounded-xl shadow-sm">
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
               Promo Activa
             </p>
             <Badge variant={topbarMeta.tone} className="text-[10px] font-bold uppercase tracking-tight">
               {topbarMeta.label}
             </Badge>
           </div>
           <Activity className="h-5 w-5 text-black/10" />
        </div>

        {/* Commerce Status */}
        <div className="flex items-center justify-between border border-black/5 bg-white p-4 rounded-xl shadow-sm">
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
               Tienda
             </p>
             <Badge variant={commerceMeta.tone} className="text-[10px] font-bold uppercase tracking-tight">
               {activeModules.tienda ? commerceMeta.label : "Desactivado"}
             </Badge>
           </div>
           <ShoppingBag className="h-5 w-5 text-black/10" />
        </div>

        {/* Public Inventory - Members */}
        <div className="flex items-center justify-between border border-black/5 bg-white p-4 rounded-xl shadow-sm">
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
               Equipo
             </p>
             <p className="text-xl font-display font-bold text-[#111111]">
               {teamMembers.length}
             </p>
           </div>
           <Users className="h-5 w-5 text-purple-600/50" />
        </div>
        
        {/* Public Inventory - Products */}
        <div className="flex items-center justify-between border border-black/5 bg-white p-4 rounded-xl shadow-sm">
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
               Productos Activos
             </p>
             <p className="text-xl font-display font-bold text-[#111111]">
               {activeModules.tienda ? storeSnapshot.products.length : 0}
             </p>
           </div>
           <ShoppingBag className="h-5 w-5 text-amber-600/50" />
        </div>

      </div>
    </div>
  );
}
