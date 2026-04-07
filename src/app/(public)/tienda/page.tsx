import type { Metadata } from "next";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import ProductFilters from "@/components/marketing/ProductFilters";
import ProductsGrid from "@/components/marketing/ProductsGrid";
import ProductToolbar from "@/components/marketing/ProductToolbar";
import { getCommerceCatalog } from "@/lib/commerce/catalog";
import {
  getActiveProducts,
  getAllProducts,
  normalizeProductFilters,
  type ProductSearchParamsInput,
} from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Tienda del gimnasio",
  description:
    "Catalogo de suplementos, accesorios y merchandising de Nuova Forza. Consulta productos destacados, disponibilidad y recogida en local.",
};

export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<ProductSearchParamsInput>;
}

export default async function ShopPage({ searchParams }: Readonly<ShopPageProps>) {
  const resolvedSearchParams = await searchParams;
  const filters = normalizeProductFilters(resolvedSearchParams);
  const catalog = await getCommerceCatalog();
  const allProducts = getActiveProducts(catalog.products);
  const filteredProducts = getAllProducts(catalog.products, filters);

  return (
    <>
      <section className="overflow-hidden border-b border-black/8 bg-[#18181b] text-white">
        <div className="section-shell relative py-20 lg:py-32">
          <div className="absolute inset-y-0 right-[-5%] hidden w-[50%] bg-[radial-gradient(circle_at_center,rgba(215,25,32,0.18),transparent_70%)] lg:block">
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>

          <div className="relative max-w-4xl">
            <p className="inline-block rounded-none bg-[#d71920] px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Nuova Forza Equipt.
            </p>
            <h1 className="mt-8 font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-[0.02em] sm:text-7xl lg:text-9xl italic">
              Potencia tu <br />
              <span className="text-[#d71920]">Rendimiento</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
              Seleccion exclusiva de suplementacion tecnica, accesorios de fuerza y merchandising
              oficial. Calidad probada en sala para quienes buscan resultados reales.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-10 md:py-14">
        {catalog.warning ? (
          <div className="mb-6">
            <PublicInlineAlert
              tone="warning"
              title="Aviso de catalogo"
              message={catalog.warning}
            />
          </div>
        ) : null}

        {catalog.status === "unavailable" ? (
          <div className="rounded-none border border-dashed border-black/12 bg-white px-6 py-12 text-center shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#6b7280]">
              Medusa no disponible
            </p>
            <h2 className="mt-4 font-display text-4xl uppercase text-[#111111]">
              El catalogo no se puede consultar ahora mismo
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">
              La tienda funciona solo con Medusa. Cuando el servicio vuelva a estar disponible, el
              catalogo aparecerá aqui sin recurrir a datos locales.
            </p>
          </div>
        ) : (
          <>
            <ProductToolbar filters={filters} resultsCount={filteredProducts.length} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
              <ProductFilters filters={filters} allProducts={allProducts} />
              <ProductsGrid products={filteredProducts} />
            </div>
          </>
        )}
      </section>
    </>
  );
}
