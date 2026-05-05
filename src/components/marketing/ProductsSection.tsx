import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isModuleEnabled } from "@/lib/data/modules";
import ProductCard from "@/components/marketing/ProductCard";
import { getCommerceCatalog } from "@/lib/commerce/catalog";
import {
  getFeaturedProducts,
} from "@/lib/data/products";

export default async function ProductsSection() {
  if (!(await isModuleEnabled("tienda"))) {
    return null;
  }

  const catalog = await getCommerceCatalog();
  const { products } = catalog;
  const featuredProducts = getFeaturedProducts(products, 4);

  return (
    <section 
      id="tienda-section" 
      data-component="products-section"
      className="section-anchor bg-background py-24 md:py-32"
      aria-labelledby="tienda-title"
    >
      <div className="section-shell">
        <div className="mb-16 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 bg-primary" />
               <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                 Equipamiento Oficial
               </p>
            </div>
            <h2 id="tienda-title" className="font-display text-3xl sm:text-5xl lg:text-7xl font-black uppercase leading-none text-foreground italic">
              Tienda <span className="text-primary">Pro</span>            </h2>
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground border-l border-border/10 pl-8">
              Suplementos de élite, accesorios de fuerza y merchandising oficial. 
              Seleccionados por nuestros preparadores para maximizar tu rendimiento.
            </p>
          </div>

          <Link 
            href="/tienda" 
            className="h-16 px-12 bg-secondary text-secondary-foreground flex items-center justify-center font-black uppercase text-[11px] tracking-[0.2em] hover:bg-primary transition-all shadow-2xl rounded-[var(--radius-base)]"
            aria-label="Ver catalogo completo de la tienda"
          >
            Ver Catálogo Completo
          </Link>
        </div>

        {catalog.status === "unavailable" ? (
          <div className="bg-card border border-dashed border-border p-12 text-center shadow-xl rounded-[var(--radius-base)]">
            <p className="text-xl font-black uppercase tracking-tight text-foreground">
              Catálogo temporalmente fuera de línea
            </p>
            <p className="mt-4 text-sm font-medium text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Estamos sincronizando el stock con el club. El catálogo profesional volverá a estar disponible en unos minutos.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="h-14 px-8 rounded-[var(--radius-base)] font-black uppercase text-[10px] tracking-widest border-border">
                <Link href="/tienda">Reintentar Acceso</Link>
              </Button>
              <Button asChild className="h-14 px-8 rounded-[var(--radius-base)] bg-secondary font-black uppercase text-[10px] tracking-widest text-white">
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
          <div className="bg-background border-2 border-dashed border-foreground/5 p-20 text-center rounded-[var(--radius-base)]">
            <p className="text-sm font-bold text-foreground/20 uppercase tracking-[0.4em]">Sin productos destacados en esta sesión.</p>
            <div className="mt-10">
               <Link href="/tienda" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline underline-offset-8">Abrir Tienda General</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
