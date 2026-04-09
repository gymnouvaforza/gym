"use client";

import { ArrowUpDown, CalendarRange, Download, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_PICKUP_REQUEST_FILTERS,
  type PickupRequestFilters,
  type PickupRequestSort,
} from "@/lib/data/pickup-request-dashboard";

import AdminSurface from "./AdminSurface";

interface PickupRequestsToolbarProps {
  filters: PickupRequestFilters;
}

export default function PickupRequestsToolbar({
  filters,
}: Readonly<PickupRequestsToolbarProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(() => filters.q);

  const updateParams = useCallback(
    (newParams: Partial<Record<keyof PickupRequestFilters, string>>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (
          value === "" ||
          value === "all" ||
          (key === "sort" && value === DEFAULT_PICKUP_REQUEST_FILTERS.sort)
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      startTransition(() => {
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams, startTransition],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.q) {
        updateParams({ q: search });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.q, search, updateParams]);

  function handleClear() {
    setSearch("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const activeFilterCount = [
    filters.q !== DEFAULT_PICKUP_REQUEST_FILTERS.q,
    filters.status !== DEFAULT_PICKUP_REQUEST_FILTERS.status,
    filters.paymentStatus !== DEFAULT_PICKUP_REQUEST_FILTERS.paymentStatus,
    filters.emailStatus !== DEFAULT_PICKUP_REQUEST_FILTERS.emailStatus,
    filters.attention !== DEFAULT_PICKUP_REQUEST_FILTERS.attention,
    filters.dateFrom !== DEFAULT_PICKUP_REQUEST_FILTERS.dateFrom,
    filters.dateTo !== DEFAULT_PICKUP_REQUEST_FILTERS.dateTo,
  ].filter(Boolean).length;

  const hasFilters =
    activeFilterCount > 0 || filters.sort !== DEFAULT_PICKUP_REQUEST_FILTERS.sort;

  const controlClassName =
    "h-10 w-full rounded-none border border-black/10 bg-[#fbfbf8] px-3 text-sm font-medium text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20";
  const exportQuery = searchParams.toString();
  const exportHref = exportQuery
    ? `/api/dashboard/pickup-requests/export?${exportQuery}`
    : "/api/dashboard/pickup-requests/export";

  return (
    <AdminSurface className="overflow-hidden border-black/10">
      <div className="flex flex-col gap-4 border-b border-black/8 bg-black/[0.03] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/8 bg-white text-[#111111]">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
              Filtros de tabla
            </p>
            <p className="truncate text-sm font-medium text-[#111111]">
              Refina la cola sin salir del listado y entra al detalle solo cuando haga falta.
            </p>
            {isPending ? (
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#d71920]">
                Actualizando bandeja...
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 border border-black/8 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#111111]">
            <span>Activos</span>
            <span className="text-[#d71920]">{activeFilterCount}</span>
          </div>
          <div className="relative min-w-[220px]">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f87]" />
            <label htmlFor="sort" className="sr-only">
              Orden
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(event) =>
                updateParams({ sort: event.target.value as PickupRequestSort })
              }
              aria-busy={isPending}
              className={`${controlClassName} pl-10`}
            >
              <option value="updated_desc">Ultima actividad primero</option>
              <option value="created_desc">Mas recientes primero</option>
              <option value="created_asc">Mas antiguos primero</option>
            </select>
          </div>
          <Button
            type="button"
            asChild
            className="h-10 rounded-none px-3 text-[10px] font-black uppercase tracking-[0.14em]"
          >
            <a href={exportHref}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isPending}
              className="h-10 rounded-none border-dashed border-black/15 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#5f6368] hover:text-[#d71920]"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 p-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(0,0.8fr))]">
        <div className="relative lg:col-span-1">
          <label htmlFor="q" className="sr-only">
            Buscar pedido
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f87]" />
          <Input
            id="q"
            placeholder="Buscar por referencia, email, cart u order..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-busy={isPending}
            className="h-10 rounded-none border-black/10 bg-[#fbfbf8] pl-10 text-sm font-medium"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]">
            Estado
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(event) => updateParams({ status: event.target.value })}
            aria-busy={isPending}
            className={controlClassName}
          >
            <option value="all">Todos los estados</option>
            <option value="requested">Solicitado</option>
            <option value="confirmed">Confirmado</option>
            <option value="ready_for_pickup">Listo para recoger</option>
            <option value="fulfilled">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="paymentStatus" className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]">
            Pago
          </label>
          <select
            id="paymentStatus"
            value={filters.paymentStatus}
            onChange={(event) => updateParams({ paymentStatus: event.target.value })}
            aria-busy={isPending}
            className={controlClassName}
          >
            <option value="all">Todo el pago</option>
            <option value="captured">Cobrado</option>
            <option value="authorized">Autorizado</option>
            <option value="pending">Pendiente</option>
            <option value="requires_more">Requiere accion</option>
            <option value="error">Error</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="emailStatus" className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]">
            Email
          </label>
          <select
            id="emailStatus"
            value={filters.emailStatus}
            onChange={(event) => updateParams({ emailStatus: event.target.value })}
            aria-busy={isPending}
            className={controlClassName}
          >
            <option value="all">Todo el email</option>
            <option value="sent">Enviado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
          </select>
        </div>

        <div>
          <label htmlFor="attention" className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]">
            Cola
          </label>
          <select
            id="attention"
            value={filters.attention}
            onChange={(event) => updateParams({ attention: event.target.value })}
            aria-busy={isPending}
            className={controlClassName}
          >
            <option value="all">Toda la operacion</option>
            <option value="action_required">Requiere accion</option>
            <option value="in_progress">En curso</option>
            <option value="ready_now">Listos para recoger</option>
            <option value="fulfilled">Entregados</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="dateFrom"
            className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]"
          >
            Desde
          </label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f87]" />
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateParams({ dateFrom: event.target.value })}
              aria-busy={isPending}
              className="h-10 rounded-none border-black/10 bg-[#fbfbf8] pl-10 text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="dateTo"
            className="mb-1 block text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]"
          >
            Hasta
          </label>
          <div className="relative">
            <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f87]" />
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateParams({ dateTo: event.target.value })}
              aria-busy={isPending}
              className="h-10 rounded-none border-black/10 bg-[#fbfbf8] pl-10 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {activeFilterCount > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-black/8 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]">
            Filtros activos
          </p>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ status: "all" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.status === DEFAULT_PICKUP_REQUEST_FILTERS.status ? "hidden" : ""
            }`}
          >
            Estado: {filters.status}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ paymentStatus: "all" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.paymentStatus === DEFAULT_PICKUP_REQUEST_FILTERS.paymentStatus ? "hidden" : ""
            }`}
          >
            Pago: {filters.paymentStatus}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ emailStatus: "all" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.emailStatus === DEFAULT_PICKUP_REQUEST_FILTERS.emailStatus ? "hidden" : ""
            }`}
          >
            Email: {filters.emailStatus}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ attention: "all" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.attention === DEFAULT_PICKUP_REQUEST_FILTERS.attention ? "hidden" : ""
            }`}
          >
            Cola: {filters.attention}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ q: "" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.q === DEFAULT_PICKUP_REQUEST_FILTERS.q ? "hidden" : ""
            }`}
          >
            Busqueda
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ dateFrom: "" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.dateFrom === DEFAULT_PICKUP_REQUEST_FILTERS.dateFrom ? "hidden" : ""
            }`}
          >
            Desde: {filters.dateFrom}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateParams({ dateTo: "" })}
            className={`h-8 rounded-none border border-black/10 px-3 text-[10px] font-black uppercase tracking-[0.14em] ${
              filters.dateTo === DEFAULT_PICKUP_REQUEST_FILTERS.dateTo ? "hidden" : ""
            }`}
          >
            Hasta: {filters.dateTo}
          </Button>
        </div>
      ) : null}
    </AdminSurface>
  );
}
