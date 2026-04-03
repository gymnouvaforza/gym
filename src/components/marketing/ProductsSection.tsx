import Link from "next/link";

import { Button } from "@/components/ui/button";
import ProductCard from "@/components/marketing/ProductCard";
import { getCommerceCatalog } from "@/lib/commerce/catalog";
import {
  getFeaturedProducts,
} from "@/lib/data/products";

export default async function ProductsSection() {
  const catalog = await getCommerceCatalog();
  const { products } = catalog;
  const featuredProducts = getFeaturedProducts(products, 4);

  return (
    <section id="tienda" className="section-anchor bg-[#fbfbf8] py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 bg-[#d71920]" />
               <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#7a7f87]">
                 Equipamiento Oficial
               </p>
            </div>
            <h2 className="font-display text-5xl font-black uppercase leading-none text-[#111111] sm:text-7xl italic">
              Tienda <span className="text-black/10">Pro</span>
            </h2>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-[#5f6368] border-l border-black/5 pl-8">
              Suplementos de élite, accesorios de fuerza y merchandising oficial. 
              Seleccionados por nuestros preparadores para maximizar tu rendimiento.
            </p>
          </div>

          <Link 
            href="/tienda" 
            className="h-16 px-12 bg-[#111111] text-white flex items-center justify-center font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#d71920] transition-all shadow-2xl"
          >
            Ver Catálogo Completo
          </Link>
        </div>

        {catalog.status === "unavailable" ? (
          <div className="bg-white border border-dashed border-black/10 p-12 text-center shadow-xl">
            <p className="text-xl font-black uppercase tracking-tight text-[#111111]">
              Catálogo temporalmente fuera de línea
            </p>
            <p className="mt-4 text-sm font-medium text-[#5f6368] max-w-lg mx-auto leading-relaxed">
              Estamos sincronizando el stock con el club. El catálogo profesional volverá a estar disponible en unos minutos.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="h-14 px-8 rounded-none font-black uppercase text-[10px] tracking-widest border-black/10">
                <Link href="/tienda">Reintentar Acceso</Link>
              </Button>
              <Button asChild className="h-14 px-8 rounded-none bg-[#111111] font-black uppercase text-[10px] tracking-widest">
                <Link href="/#contacto">Consultar Disponibilidad</Link>
              </Button>
            </div>
          </div>
        ) : featuredProducts.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-[#fbfbf8] border-2 border-dashed border-black/5 p-20 text-center">
            <p className="text-sm font-bold text-black/20 uppercase tracking-[0.4em]">Sin productos destacados en esta sesión.</p>
            <div className="mt-10">
               <Link href="/tienda" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d71920] hover:underline underline-offset-8">Abrir Tienda General</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
