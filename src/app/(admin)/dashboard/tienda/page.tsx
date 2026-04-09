import { Suspense, cache } from "react";
import {
  ShoppingBag,
  Tag,
  Layers,
  Truck,
  ArrowUpRight,
  Database,
  BarChart4,
} from "lucide-react";
import Link from "next/link";

import { buildCommerceMetrics, getCommerceSourceMeta } from "@/lib/admin-dashboard";
import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "@/components/ui/loading-state";
import { buildStoreCategoryTree } from "@/lib/data/store";
import { getStoreAdminSnapshot } from "@/lib/data/store-admin";

const getStoreSnapshotCached = cache(async () => getStoreAdminSnapshot());

function StoreMetricsFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <SectionSkeleton key={index} lines={3} className="min-h-[150px]" />
      ))}
    </div>
  );
}

function StoreSidebarFallback() {
  return (
    <aside className="space-y-8">
      <div className="sticky top-24 space-y-8">
        <SectionSkeleton lines={5} className="min-h-[240px]" />
        <SectionSkeleton lines={4} className="min-h-[180px]" />
        <SectionSkeleton lines={3} className="min-h-[180px]" />
      </div>
    </aside>
  );
}

async function StoreWarningBanner() {
  const snapshot = await getStoreSnapshotCached();

  if (!snapshot.warning) {
    return null;
  }

  return <DashboardNotice message={snapshot.warning} tone="warning" />;
}

async function StoreHeaderSource() {
  const snapshot = await getStoreSnapshotCached();
  const sourceMeta = getCommerceSourceMeta(snapshot.source, {
    warning: snapshot.warning,
  });

  return (
    <div className="flex items-center gap-4 border border-black/10 bg-white p-4 shadow-sm">
      <Database className="h-5 w-5 text-amber-500" />
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
          Data Source
        </p>
        <p className="text-sm font-bold uppercase tracking-tighter text-[#111111]">
          {sourceMeta.label}
        </p>
      </div>
    </div>
  );
}

async function StoreMainContent() {
  const snapshot = await getStoreSnapshotCached();
  const metrics = buildCommerceMetrics(snapshot.products, snapshot.source, {
    warning: snapshot.warning,
  });
  const categoryTree = buildStoreCategoryTree(snapshot.categories);
  const subcategoriesCount = snapshot.categories.filter((category) => category.parent_id).length;

  return (
    <main className="space-y-12">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            {...metric}
            className="border-none shadow-md transition-all hover:shadow-xl"
          />
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-[#111111]">
            Gestion Operativa
          </h2>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/dashboard/tienda/productos"
            className="group relative overflow-hidden bg-[#111111] p-8 transition-all hover:bg-black"
          >
            <div className="relative z-10 space-y-4">
              <Tag className="h-8 w-8 text-white/20 transition-colors group-hover:text-[#d71920]" />
              <h3 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
                Catalogo Pro
              </h3>
              <p className="max-w-[240px] text-sm leading-relaxed text-white/60">
                Edita descripciones, precios y visibilidad de productos.
              </p>
              <div className="flex items-center gap-2 pt-4 text-[10px] font-black uppercase tracking-widest text-white">
                Entrar al Catalogo <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-[#d71920]/10" />
          </Link>

          <Link
            href="/dashboard/tienda/categorias"
            className="group relative overflow-hidden border border-black/10 bg-white p-8 transition-all hover:border-[#111111]"
          >
            <div className="relative z-10 space-y-4">
              <Layers className="h-8 w-8 text-black/10 transition-colors group-hover:text-[#111111]" />
              <h3 className="font-display text-2xl font-black uppercase tracking-tighter text-[#111111]">
                Taxonomia
              </h3>
              <p className="max-w-[240px] text-sm leading-relaxed text-[#7a7f87]">
                Organiza la jerarquia de categorias y subcategorias.
              </p>
              <div className="flex items-center gap-2 pt-4 text-[10px] font-black uppercase tracking-widest text-[#111111]">
                Configurar Arbol <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </Link>
        </div>

        <AdminSurface inset className="border-l-4 border-amber-500 bg-[#fbfbf8] p-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                Estructura Storefront
              </p>
              <h4 className="text-xl font-bold uppercase tracking-tight text-[#111111]">
                Jerarquia de Navegacion
              </h4>
              <p className="max-w-xl text-sm leading-relaxed text-[#5f6368]">
                Actualmente el sitio publico renderiza{" "}
                <span className="font-bold text-[#111111]">{categoryTree.length} categorias principales</span> y{" "}
                <span className="font-bold text-[#111111]">{subcategoriesCount} sub-niveles</span> de
                filtrado tecnico.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="font-display text-2xl font-black text-[#111111]">{categoryTree.length}</p>
                <p className="text-[9px] font-black uppercase text-[#7a7f87]">Roots</p>
              </div>
              <div className="h-10 w-px bg-black/5" />
              <div className="text-center">
                <p className="font-display text-2xl font-black text-[#111111]">{subcategoriesCount}</p>
                <p className="text-[9px] font-black uppercase text-[#7a7f87]">Leafs</p>
              </div>
            </div>
          </div>
        </AdminSurface>
      </section>
    </main>
  );
}

async function StoreSidebar() {
  const snapshot = await getStoreSnapshotCached();

  return (
    <aside className="space-y-8">
      <div className="sticky top-24 space-y-8">
        <div className="bg-[#111111] p-6 text-white shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <BarChart4 className="h-4 w-4 text-[#d71920]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Inventario Snapshot
            </p>
          </div>
          <div className="space-y-6">
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Productos Totales
              </p>
              <p className="font-display text-3xl font-black leading-none text-white">
                {snapshot.products.length}
              </p>
            </div>
            <div className="flex items-end justify-between border-b border-white/5 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                En Catalogo
              </p>
              <p className="font-display text-3xl font-black leading-none text-white">
                {snapshot.products.filter((product) => !product.pickup_only).length}
              </p>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Recogida Club
              </p>
              <p className="font-display text-3xl font-black leading-none text-[#d71920]">
                {snapshot.products.filter((product) => product.pickup_only).length}
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/tienda/pedidos"
          className="group block space-y-4 border border-[#d71920]/10 bg-[#fff3f3] p-6 transition-all hover:border-[#d71920]"
        >
          <div className="flex items-center justify-between">
            <Truck className="h-5 w-5 text-[#d71920]" />
            <ArrowUpRight className="h-4 w-4 text-[#d71920]/20 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#d71920]">
            Fulfillment
          </p>
          <p className="text-sm font-bold leading-relaxed text-[#111111]">
            Gestiona las ordenes de <span className="font-black">Click & Collect</span> realizadas
            desde el sitio publico.
          </p>
        </Link>

        <div className="space-y-4">
          <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#111111]">
            Data Integrity
          </h3>
          <div className="space-y-4 border border-black/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase text-[#7a7f87]">Source Status</p>
              <Badge variant="success" className="text-[9px] font-black uppercase">
                Online
              </Badge>
            </div>
            <div className="h-px bg-black/5" />
            <p className="text-[10px] leading-relaxed text-[#7a7f87]">
              Sincronizado con el provider{" "}
              <span className="font-bold uppercase text-[#111111]">{snapshot.source}</span>. Los cambios
              pueden tardar hasta 2 min en reflejarse en el edge.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardStorePage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="RETAIL CONSOLE"
          description="Control de inventario, taxonomias y logistica de recogida local."
          icon={ShoppingBag}
          eyebrow="Commerce Engine"
          className="pb-0"
        />
        <Suspense fallback={<div className="h-14 w-full max-w-xs animate-pulse bg-black/6 md:w-64" />}>
          <StoreHeaderSource />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton lines={2} />}>
        <StoreWarningBanner />
      </Suspense>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_340px]">
        <Suspense fallback={<StoreMetricsFallback />}>
          <StoreMainContent />
        </Suspense>
        <Suspense fallback={<StoreSidebarFallback />}>
          <StoreSidebar />
        </Suspense>
      </div>
    </div>
  );
}
