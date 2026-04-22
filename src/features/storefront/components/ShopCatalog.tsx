"use client";

import { useSearchParams } from "next/navigation";
import ProductFilters from "@/components/marketing/ProductFilters";
import ProductsGrid from "@/components/marketing/ProductsGrid";
import ProductToolbar from "@/components/marketing/ProductToolbar";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import type { Product } from "@/data/types";
import { getAllProducts, normalizeProductFilters } from "@/lib/data/products";

interface ShopCatalogProps {
  products: Product[];
  status: "ready" | "unavailable";
  warning: string | null;
}

export function ShopCatalog({
  products,
  status,
  warning,
}: Readonly<ShopCatalogProps>) {
  const searchParams = useSearchParams();
  
  const filters = normalizeProductFilters({
    categoria: searchParams.get("categoria") ?? undefined,
    destacados: searchParams.get("destacados") ?? undefined,
    disponibilidad: searchParams.get("disponibilidad") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });
  
  const filteredProducts = getAllProducts(products, filters);

  if (status === "unavailable") {
    return (
      <div className="rounded-none border border-dashed border-black/12 bg-white px-6 py-12 text-center shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">
          Servicio no disponible
        </p>
        <h2 className="mt-4 font-display text-4xl uppercase text-[#111111]">
          El catalogo no se puede consultar ahora mismo
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">
          Estamos trabajando para restablecer el acceso a la tienda. Por favor, intenta de nuevo mas tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {warning && (
        <PublicInlineAlert
          tone="warning"
          title="Aviso de catalogo"
          message={warning}
        />
      )}

      <ProductToolbar filters={filters} resultsCount={filteredProducts.length} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="sticky top-24">
          <ProductFilters filters={filters} allProducts={products} />
        </aside>
        <main>
          <ProductsGrid products={filteredProducts} />
        </main>
      </div>
    </div>
  );
}
