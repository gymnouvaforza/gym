import Image from "next/image";
import Link from "next/link";


import { Button } from "@/components/ui/button";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";

export default function ProductsSection() {
  return (
    <section id="productos" className="section-anchor bg-[#f5f5f0] py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-16">
          <p className="section-kicker">Suplementación Elite</p>
          <h2 className="section-title italic">
            Tienda <span className="text-accent underline decoration-accent/20 underline-offset-8">Oficial</span>
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {novaForzaHomeContent.featuredProducts.map((product) => (
            <article key={product.name} className="group relative flex flex-col bg-white transition-all duration-500 hover:shadow-2xl">
              <div className="relative aspect-square overflow-hidden bg-zinc-100">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 right-0 bg-accent px-4 py-2 font-display text-lg font-bold text-white">
                  {product.price}
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
                  {product.category}
                </p>
                <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-tight text-foreground line-clamp-2 min-h-[56px]">
                  {product.name}
                </h3>
                <Button asChild className="btn-athletic btn-primary mt-8 w-full">
                  <Link href="#contacto">Comprar Ahora</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
