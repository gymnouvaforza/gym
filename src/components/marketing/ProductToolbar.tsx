"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import type { ProductCatalogueFilters } from "@/lib/data/products";

interface ProductToolbarProps {
  filters: ProductCatalogueFilters;
  resultsCount: number;
}

const sortLabels = {
  featured: "Destacados",
  price_asc: "Precio ascendente",
  price_desc: "Precio descendente",
  name: "Nombre",
} as const;

export default function ProductToolbar({
  filters,
  resultsCount,
}: Readonly<ProductToolbarProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localQuery, setLocalQuery] = useState(filters.query);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/tienda?${params.toString()}`, { scroll: false });
    });
  }, [router, searchParams, startTransition]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== filters.query) {
        updateParams({ q: localQuery });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [localQuery, filters.query, updateParams]);

  return (
    <div className="border border-black/8 bg-white p-4 shadow-[0_20px_60px_-40px_rgba(17,17,17,0.2)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280]">
            Catálogo
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs font-medium text-[#4b5563]">
              {resultsCount} {resultsCount === 1 ? "producto" : "productos"}{" "}
              {filters.query ? `para "${filters.query}"` : "disponibles"}
            </p>
            {isPending && (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#d71920] border-t-transparent" />
            )}
          </div>
        </div>

        <div className="grid flex-1 gap-2.5 sm:grid-cols-[1fr,200px] xl:max-w-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-10 w-full border border-black/8 bg-[#faf8f4] pl-9 pr-4 text-sm text-[#111111] outline-none transition focus:border-[#d71920]/40 focus:bg-white"
            />
          </div>

          <div className="relative">
            <select
              defaultValue={filters.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="h-10 w-full border border-black/8 bg-[#faf8f4] px-4 py-0 text-sm text-[#111111] outline-none transition focus:border-[#d71920]/40 focus:bg-white"
            >
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
