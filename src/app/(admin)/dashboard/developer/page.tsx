import { Wrench, ShieldCheck } from "lucide-react";

import DeveloperModuleConsole from "@/components/admin/DeveloperModuleConsole";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { Card } from "@/components/ui/card";
import { listSystemModules } from "@/lib/data/modules";
import { requireDashboardAccessModes } from "@/lib/auth";

export default async function DashboardDeveloperPage() {
  const accessState = await requireDashboardAccessModes(["admin", "superadmin", "local"]);
  const modules = await listSystemModules();
  const isSuperadmin = accessState.accessMode === "superadmin";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <DashboardPageHeader
          title="DEVELOPER"
          description="Consola de feature flags y gobierno de modulos del backoffice."
          icon={Wrench}
          eyebrow="Root Controls"
          className="pb-0"
        />
        <div className="flex items-center gap-4 bg-[#111111] p-4 text-white shadow-xl">
          <ShieldCheck className="h-5 w-5 text-[#d71920]" />
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
              Nivel
            </p>
            <p className="text-sm font-black uppercase tracking-tight">
              {isSuperadmin ? "Superadmin" : "Admin"}
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none bg-[#111111] p-6 text-white shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/40">
          Modo Kernel
        </p>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-white/70">
          Cada switch apaga rutas, accesos UI y controles operativos del modulo. El bypass solo
          existe para superadmin.
        </p>
        {!isSuperadmin ? (
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-amber-300">
            Acceso admin en modo lectura. Puedes revisar estado de modulos, pero solo superadmin
            puede cambiar feature flags.
          </p>
        ) : null}
      </Card>

      <DeveloperModuleConsole modules={modules} canManage={isSuperadmin} />
    </div>
  );
}
