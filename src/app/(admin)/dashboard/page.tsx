import { Dumbbell, Inbox, Megaphone, Package, Settings2, ShieldCheck, Users } from "lucide-react";

import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderedTrainingZones } from "@/data/training-zones";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import { plannedModules } from "@/lib/data/default-content";
import { getDashboardData } from "@/lib/data/site";
import { resolveTopbarStatus } from "@/lib/topbar";

function countNewLeads(totalStatuses: Array<"new" | "contacted" | "closed">) {
  return totalStatuses.filter((status) => status === "new").length;
}

export default async function DashboardPage() {
  const { leads, settings, warning } = await getDashboardData();
  const newLeads = countNewLeads(leads.map((lead) => lead.status));
  const topbarStatus = resolveTopbarStatus(settings);
  const trainingZones = getOrderedTrainingZones();
  const contentSummary = [
    {
      label: "Topbar",
      value: topbarStatus === "active" ? "Activo" : topbarStatus === "expired" ? "Caducado" : "Inactivo",
      icon: Megaphone,
    },
    { label: "Zonas", value: trainingZones.length, icon: Dumbbell },
    { label: "Planes activos", value: novaForzaHomeContent.plans.length, icon: ShieldCheck },
    { label: "Entrenadores", value: novaForzaHomeContent.team.length, icon: Users },
    { label: "Productos", value: novaForzaHomeContent.featuredProducts.length, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Resumen"
        description="Vista rapida del estado comercial de Nova Forza: leads, identidad activa y contenido visible en la home."
      />

      {warning ? <DashboardNotice message={warning} /> : null}

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="border-white/10 bg-zinc-950/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4 text-[#fca5a5]" />
              Leads totales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold text-white">{leads.length}</p>
            <p className="text-sm text-zinc-400">{newLeads} pendientes de revisar.</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-4 w-4 text-[#fca5a5]" />
              Identidad actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold text-white">{settings.site_name}</p>
            <p className="text-sm text-zinc-400">{settings.site_tagline}</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-[#fca5a5]" />
              Alcance actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-lg font-semibold text-white">Web publica + mini backoffice</p>
            <p className="text-sm text-zinc-400">
              La base queda lista para crecer sin meter complejidad prematura.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-zinc-950/80">
        <CardHeader>
          <CardTitle>Contenido publicado</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {contentSummary.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d71920]/12 text-[#fca5a5]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-zinc-950/80">
        <CardHeader>
          <CardTitle>Contacto visible</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Email
            </p>
            <p className="mt-3 text-sm text-white">{settings.contact_email}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Telefono
            </p>
            <p className="mt-3 text-sm text-white">{settings.contact_phone ?? "Pendiente"}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
              Horario
            </p>
            <p className="mt-3 text-sm text-white">{settings.opening_hours ?? "Pendiente"}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-zinc-950/80">
        <CardHeader>
          <CardTitle>Modulos previstos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {plannedModules.map((module) => (
            <Badge key={module} variant="muted">
              {module}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
