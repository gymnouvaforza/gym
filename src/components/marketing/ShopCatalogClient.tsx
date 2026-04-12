"use client";

import { useSearchParams } from "next/navigation";

import ProductFilters from "@/components/marketing/ProductFilters";
import ProductsGrid from "@/components/marketing/ProductsGrid";
import ProductToolbar from "@/components/marketing/ProductToolbar";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import type { Product } from "@/data/types";
import { getAllProducts, normalizeProductFilters } from "@/lib/data/products";

interface ShopCatalogClientProps {
  products: Product[];
  status: "ready" | "unavailable";
  warning: string | null;
}

export default function ShopCatalogClient({
  products,
  status,
  warning,
}: Readonly<ShopCatalogClientProps>) {
  const searchParams = useSearchParams();
  const filters = normalizeProductFilters({
    categoria: searchParams.get("categoria") ?? undefined,
    destacados: searchParams.get("destacados") ?? undefined,
    disponibilidad: searchParams.get("disponibilidad") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });
  const filteredProducts = getAllProducts(products, filters);

  return (
    <>
      {warning ? (
        <div className="mb-6">
          <PublicInlineAlert
            tone="warning"
            title="Aviso de catalogo"
            message={warning}
          />
        </div>
      ) : null}

      {status === "unavailable" ? (
        <div className="rounded-none border border-dashed border-black/12 bg-white px-6 py-12 text-center shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">
            Medusa no disponible
          </p>
          <h2 className="mt-4 font-display text-4xl uppercase text-[#111111]">
            El catalogo no se puede consultar ahora mismo
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">
            La tienda funciona solo con Medusa. Cuando el servicio vuelva a estar disponible, el
            catalogo aparecera aqui sin recurrir a datos locales.
          </p>
        </div>
      ) : (
        <>
          <ProductToolbar filters={filters} resultsCount={filteredProducts.length} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
            <ProductFilters filters={filters} allProducts={products} />
            <ProductsGrid products={filteredProducts} />
          </div>
        </>
      )}
    </>
  );
}
