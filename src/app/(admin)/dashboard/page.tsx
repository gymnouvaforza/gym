import { Suspense, cache } from "react";
import {
  ShieldCheck,
  ShoppingBag,
  Users,
  ArrowUpRight,
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { getOrderedTrainingZones } from "@/data/training-zones";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "@/components/ui/loading-state";
import {
  buildCommerceMetrics,
  buildDashboardMetrics,
  countLeadsByStatus,
  getCommerceSourceMeta,
  getTopbarStatusMeta,
} from "@/lib/admin-dashboard";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import { getDashboardData } from "@/lib/data/site";
import { getStoreAdminSnapshot } from "@/lib/data/store-admin";
import { resolveTopbarStatus } from "@/lib/topbar";
import { cn } from "@/lib/utils";

const getDashboardDataCached = cache(async () => getDashboardData());
const getStoreSnapshotCached = cache(async () => getStoreAdminSnapshot());

function DashboardLeadSectionFallback() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse bg-[#d71920]/20" />
          <div className="h-8 w-40 animate-pulse bg-black/6" />
        </div>
        <div className="h-4 w-32 animate-pulse bg-black/6" />
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

function DashboardCommerceSectionFallback() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse bg-black/10" />
          <div className="h-8 w-40 animate-pulse bg-black/6" />
        </div>
        <div className="h-4 w-36 animate-pulse bg-black/6" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} lines={3} className="min-h-[150px]" />
        ))}
      </div>
    </section>
  );
}

function DashboardSidebarFallback() {
  return (
    <aside className="space-y-8">
      <div className="sticky top-24 space-y-8">
        <SectionSkeleton lines={6} className="min-h-[320px]" />
        <SectionSkeleton lines={4} className="min-h-[280px]" />
        <SectionSkeleton lines={3} className="min-h-[180px]" />
      </div>
    </aside>
  );
}

async function DashboardWarnings() {
  const [{ warning }, storeSnapshot] = await Promise.all([
    getDashboardDataCached(),
    getStoreSnapshotCached(),
  ]);

  if (!warning && !storeSnapshot.warning) {
    return null;
  }

  return (
    <div className="space-y-2">
      {warning ? <DashboardNotice message={warning} tone="warning" /> : null}
      {storeSnapshot.warning ? <DashboardNotice message={storeSnapshot.warning} tone="info" /> : null}
    </div>
  );
}

async function DashboardLeadSection() {
  const { leads } = await getDashboardDataCached();
  const leadSummary = countLeadsByStatus(leads);
  const newLeads = leadSummary.new;
  const leadMetrics = buildDashboardMetrics(leads, newLeads);
  const processedRatio =
    leads.length > 0 ? Math.round(((leadSummary.contacted + leadSummary.closed) / leads.length) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#d71920] text-white">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-[#111111]">
            Captacion
          </h2>
        </div>
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7a7f87] transition-colors hover:text-[#d71920]"
        >
          Ver embudo completo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {leadMetrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            {...metric}
            className="border-none shadow-md transition-all hover:shadow-xl"
          />
        ))}
      </div>

      <AdminSurface inset className="border-l-4 border-[#d71920] p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-wide text-[#111111]">
              Eficiencia del embudo
            </p>
            <p className="text-sm leading-relaxed text-[#5f6368]">
              De los <span className="font-bold text-[#111111]">{leads.length}</span> contactos totales,
              un <span className="font-bold text-[#d71920]"> {processedRatio}% </span>
              ha sido procesado por el equipo comercial.
            </p>
          </div>
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black/5 text-[10px] font-bold"
              >
                U{item}
              </div>
            ))}
          </div>
        </div>
      </AdminSurface>
    </section>
  );
}

async function DashboardCommerceSection() {
  const storeSnapshot = await getStoreSnapshotCached();
  const commerceMetrics = buildCommerceMetrics(storeSnapshot.products, storeSnapshot.source, {
    warning: storeSnapshot.warning,
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#111111] text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-[#111111]">
            Commerce
          </h2>
        </div>
        <Link
          href="/dashboard/tienda"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7a7f87] transition-colors hover:text-[#111111]"
        >
          Gestionar catalogo <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {commerceMetrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} className="border-none shadow-md" />
        ))}
      </div>
    </section>
  );
}

async function DashboardSidebarPanel() {
  const [{ settings, leads }, storeSnapshot] = await Promise.all([
    getDashboardDataCached(),
    getStoreSnapshotCached(),
  ]);

  const leadSummary = countLeadsByStatus(leads);
  const newLeads = leadSummary.new;
  const topbarMeta = getTopbarStatusMeta(resolveTopbarStatus(settings));
  const commerceMeta = getCommerceSourceMeta(storeSnapshot.source, {
    warning: storeSnapshot.warning,
  });
  const inventory = [
    {
      label: "Zonas entrenamiento",
      value: String(getOrderedTrainingZones().length),
      icon: ShieldCheck,
      color: "text-blue-600",
    },
    {
      label: "Productos tienda",
      value: String(storeSnapshot.products.length),
      icon: ShoppingBag,
      color: "text-amber-600",
    },
    {
      label: "Equipo tecnico",
      value: String(novaForzaHomeContent.team.length),
      icon: Users,
      color: "text-purple-600",
    },
  ];

  return (
    <aside className="space-y-8">
      <div className="sticky top-24 space-y-8">
        <AdminSurface className="overflow-hidden border-black/10 bg-white p-0 shadow-lg">
          <div className="bg-[#111111] p-6 text-white">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Identidad Digital
            </p>
            <h3 className="mt-4 text-center font-display text-2xl font-black uppercase leading-tight tracking-tighter">
              {settings.site_name}
            </h3>
          </div>
          <div className="space-y-6 p-6">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87]">
                Tagline activo
              </p>
              <p className="text-sm font-medium italic leading-relaxed text-[#111111]">
                &quot;{settings.site_tagline}&quot;
              </p>
            </div>

            <div className="h-px bg-black/5" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
                  Marketing
                </span>
                <Badge variant={topbarMeta.tone} className="text-[9px] font-black uppercase tracking-tighter">
                  {topbarMeta.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
                  Catalogo
                </span>
                <Badge
                  variant={commerceMeta.tone}
                  className="text-[9px] font-black uppercase tracking-tighter"
                >
                  {commerceMeta.label}
                </Badge>
              </div>
            </div>

            <div className="border border-black/5 bg-[#fbfbf8] p-4">
              <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#7a7f87]">
                Promo activa
              </p>
              <p className="text-xs font-bold leading-relaxed text-[#111111]">
                {settings.topbar_text || "Sin promocion destacada en el sitio publico."}
              </p>
            </div>
          </div>
        </AdminSurface>

        <div className="space-y-4">
          <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]">
            Inventario Publico
          </h3>
          <div className="grid gap-2">
            {inventory.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="group flex items-center justify-between border border-black/10 bg-white p-4 transition-all hover:border-[#111111] hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center bg-[#fbfbf8] transition-all group-hover:bg-[#111111] group-hover:text-white",
                        item.color,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-display font-black leading-none text-[#111111]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-black/10 transition-all group-hover:text-[#111111]" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 border border-[#d71920]/10 bg-[#fff3f3] p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#d71920]">
            Atencion Requerida
          </p>
          <p className="text-sm font-bold leading-relaxed text-[#111111]">
            Tienes <span className="text-[#d71920]">{newLeads} leads nuevos</span> esperando respuesta.
            La velocidad de contacto define el cierre.
          </p>
          <Link
            href="/dashboard/leads"
            className="inline-block bg-[#d71920] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#111111]"
          >
            Atender Leads
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="COMMAND CENTER"
          description="Monitoreo en tiempo real de la operacion, captacion y salud comercial del club."
          icon={Activity}
          eyebrow="Dashboard v2.0"
          className="pb-0"
        />
        <div className="flex items-center gap-4 border border-black/10 bg-white p-4 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
              Status Global
            </p>
            <p className="text-sm font-bold uppercase tracking-tighter text-[#111111]">
              Operativo · Online
            </p>
          </div>
          <div className="h-10 w-1 bg-green-500" />
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

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_380px]">
        <div className="space-y-12">
          <Suspense fallback={<DashboardLeadSectionFallback />}>
            <DashboardLeadSection />
          </Suspense>
          <Suspense fallback={<DashboardCommerceSectionFallback />}>
            <DashboardCommerceSection />
          </Suspense>
        </div>

        <Suspense fallback={<DashboardSidebarFallback />}>
          <DashboardSidebarPanel />
        </Suspense>
      </div>
    </div>
  );
}
