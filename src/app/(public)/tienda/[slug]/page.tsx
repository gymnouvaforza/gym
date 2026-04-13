import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLdScript from "@/components/marketing/JsonLdScript";
import ProductCard from "@/components/marketing/ProductCard";
import ProductDetail from "@/components/marketing/ProductDetail";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { getCommerceCatalog, getCommerceProductBySlug } from "@/lib/commerce/catalog";
import {
  getActiveProducts,
  getRelatedProducts,
  productCategoryLabels,
} from "@/lib/data/products";
import { getMarketingData } from "@/lib/data/site";
import {
  buildBreadcrumbJsonLd,
  buildNoIndexMetadata,
  buildPageMetadata,
  buildProductJsonLd,
} from "@/lib/seo";

export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const snapshot = await getCommerceCatalog();

  if (snapshot.status !== "ready") {
    return [];
  }

  return getActiveProducts(snapshot.products).map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: Readonly<ProductDetailPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const [snapshot, { settings }] = await Promise.all([
    getCommerceProductBySlug(slug),
    getMarketingData(),
  ]);
  const product = snapshot.product;

  if (snapshot.status === "unavailable") {
    return buildNoIndexMetadata(
      "Tienda temporalmente no disponible",
      "El catalogo de Nuova Forza no se puede consultar ahora mismo.",
    );
  }

  if (!product || snapshot.status === "not_found") {
    return buildNoIndexMetadata("Producto no encontrado");
  }

  return buildPageMetadata({
    description: product.short_description,
    imageUrl: product.images[0] ?? settings.seo_og_image_url,
    path: `/tienda/${product.slug}`,
    robots: {
      follow: true,
      index: true,
    },
    siteName: settings.site_name,
    title: product.name,
  });
}

export default async function ProductDetailPage({
  params,
}: Readonly<ProductDetailPageProps>) {
  const { slug } = await params;
  const [productSnapshot, catalog] = await Promise.all([
    getCommerceProductBySlug(slug),
    getCommerceCatalog(),
  ]);
  const product = productSnapshot.product;

  if (productSnapshot.status === "unavailable") {
    return (
      <section className="section-shell py-16 md:py-24">
        <div className="space-y-6 rounded-none border border-amber-300/70 bg-amber-50 px-6 py-10 text-center text-amber-900 shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
          <PublicInlineAlert
            tone="warning"
            title="Medusa no disponible"
            message="La ficha de producto no se puede cargar ahora mismo."
            compact
          />
          <h1 className="mt-4 font-display text-4xl uppercase text-[#111111]">
            La ficha de producto no se puede cargar ahora mismo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">
            La tienda funciona solo con Medusa. Cuando el servicio se recupere, esta ficha volvera
            a estar disponible sin usar datos locales ni fallback silencioso.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/tienda"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-[#111111] transition hover:text-[#d71920]"
            >
              Volver al catalogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!product || productSnapshot.status === "not_found") {
    notFound();
  }

  const relatedProducts = getRelatedProducts(catalog.products, product, 3);

  return (
    <>
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Tienda", path: "/tienda" },
          { name: product.name, path: `/tienda/${product.slug}` },
        ])}
      />
      <JsonLdScript data={buildProductJsonLd(product)} />

      {productSnapshot.warning ? (
        <div className="section-shell pt-8">
          <PublicInlineAlert
            tone="warning"
            title="Aviso de catalogo"
            message={productSnapshot.warning}
          />
        </div>
      ) : null}

      <ProductDetail product={product} />

      <section className="section-shell border-t border-black/10 py-20 lg:py-32">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 bg-[#d71920]" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#7a7f87]">
                Completar tu entrenamiento
              </p>
            </div>
            <h2 className="font-display text-5xl font-black uppercase leading-none text-[#111111] sm:text-6xl italic">
              Linea <span className="text-black/10">relacionada</span>
            </h2>
            <p className="max-w-2xl border-l border-black/5 pl-6 text-sm font-medium leading-7 text-[#5f6368]">
              Seleccion tecnica recomendada por nuestros preparadores para maximizar el rendimiento
              en la categoria de {productCategoryLabels[product.category]}.
            </p>
          </div>
          <Link
            href={`/tienda?categoria=${product.category}`}
            className="flex h-12 items-center justify-center bg-[#111111] px-8 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[#d71920]"
          >
            Ver toda la gama
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </>
  );
}
