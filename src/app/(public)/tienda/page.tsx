import type { Metadata } from "next";

import ShopCatalogClient from "@/components/marketing/ShopCatalogClient";
import { getCommerceCatalog } from "@/lib/commerce/catalog";
import { getActiveProducts } from "@/lib/data/products";
import { getMarketingData } from "@/lib/data/site";
import { buildMarketingMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingData();

  return buildMarketingMetadata(settings, {
    description:
      "Catalogo de suplementos, accesorios de fuerza y merchandising con recogida local en Chiclayo.",
    path: "/tienda",
    title: "Tienda pickup de suplementos y accesorios",
  });
}

export const revalidate = 60;

export default async function ShopPage() {
  const catalog = await getCommerceCatalog();
  const allProducts = getActiveProducts(catalog.products);

  return (
    <>
      <section className="overflow-hidden border-b border-black/8 bg-[#18181b] text-white">
        <div className="section-shell relative py-20 lg:py-32">
          <div className="absolute inset-y-0 right-[-5%] hidden w-[50%] bg-[radial-gradient(circle_at_center,rgba(215,25,32,0.18),transparent_70%)] lg:block">
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:40px_40px]" />
          </div>

          <div className="relative max-w-4xl">
            <p className="inline-block rounded-none bg-[#d71920] px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Nuova Forza Equip
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
        <ShopCatalogClient
          products={allProducts}
          status={catalog.status}
          warning={catalog.warning}
        />
      </section>
    </>
  );
}
