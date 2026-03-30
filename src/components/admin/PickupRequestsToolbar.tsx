"use client";

import { Search, X } from "lucide-react";
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
  const [, startTransition] = useTransition();

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
    router.push(pathname, { scroll: false });
  }

  const hasFilters =
    filters.q !== DEFAULT_PICKUP_REQUEST_FILTERS.q ||
    filters.status !== DEFAULT_PICKUP_REQUEST_FILTERS.status ||
    filters.paymentStatus !== DEFAULT_PICKUP_REQUEST_FILTERS.paymentStatus ||
    filters.emailStatus !== DEFAULT_PICKUP_REQUEST_FILTERS.emailStatus ||
    filters.attention !== DEFAULT_PICKUP_REQUEST_FILTERS.attention ||
    filters.sort !== DEFAULT_PICKUP_REQUEST_FILTERS.sort;

  return (
    <AdminSurface inset className="flex flex-col gap-4 p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-1.5">
          <label htmlFor="q" className="text-xs font-medium text-[#5f6368]">
            Buscar
          </label>
          <p className="text-xs leading-5 text-[#7a7f87]">
            Filtra por referencia, email, cart, order o PayPal order sin salir del tablero.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f87]" />
            <Input
              id="q"
              placeholder="NF-2026, cliente@email.com, order_..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <label htmlFor="status" className="text-xs font-medium text-[#5f6368]">
              Estado
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(event) => updateParams({ status: event.target.value })}
              className="h-11 w-full rounded-none border border-black/10 bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20"
            >
              <option value="all">Todos</option>
              <option value="requested">Solicitado</option>
              <option value="confirmed">Confirmado</option>
              <option value="ready_for_pickup">Listo para recoger</option>
              <option value="fulfilled">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="paymentStatus" className="text-xs font-medium text-[#5f6368]">
              Pago
            </label>
            <select
              id="paymentStatus"
              value={filters.paymentStatus}
              onChange={(event) => updateParams({ paymentStatus: event.target.value })}
              className="h-11 w-full rounded-none border border-black/10 bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20"
            >
              <option value="all">Todos</option>
              <option value="captured">Cobrado</option>
              <option value="authorized">Autorizado</option>
              <option value="pending">Pendiente</option>
              <option value="requires_more">Requiere accion</option>
              <option value="error">Error</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="emailStatus" className="text-xs font-medium text-[#5f6368]">
              Email
            </label>
            <select
              id="emailStatus"
              value={filters.emailStatus}
              onChange={(event) => updateParams({ emailStatus: event.target.value })}
              className="h-11 w-full rounded-none border border-black/10 bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20"
            >
              <option value="all">Todos</option>
              <option value="sent">Enviado</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallido</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="attention" className="text-xs font-medium text-[#5f6368]">
              Cola
            </label>
            <select
              id="attention"
              value={filters.attention}
              onChange={(event) => updateParams({ attention: event.target.value })}
              className="h-11 w-full rounded-none border border-black/10 bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20"
            >
              <option value="all">Toda la operacion</option>
              <option value="action_required">Requiere accion</option>
              <option value="in_progress">En curso</option>
              <option value="ready_now">Listos para recoger</option>
              <option value="fulfilled">Entregados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7a7f87]">Orden</p>
          <select
            id="sort"
            value={filters.sort}
            onChange={(event) =>
              updateParams({ sort: event.target.value as PickupRequestSort })
            }
            className="h-11 min-w-[220px] rounded-none border border-black/10 bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20"
          >
            <option value="updated_desc">Ultima actividad primero</option>
            <option value="created_desc">Mas recientes primero</option>
            <option value="created_asc">Mas antiguos primero</option>
          </select>
        </div>

        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="h-11 border-dashed border-[#7a7f87]/30 font-medium tracking-normal text-[#5f6368] hover:text-[#d71920]"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        ) : null}
      </div>
    </AdminSurface>
  );
}
