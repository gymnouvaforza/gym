"use client";

import Link from "next/link";
import { CheckCircle2, FileText, Store, TimerReset } from "lucide-react";

import ProductPurchasePanel from "@/components/cart/ProductPurchasePanel";
import ProductGallery from "@/components/marketing/ProductGallery";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/types";
import {
  formatProductPrice,
  formatUsdPrice,
  getProductStockMeta,
  productCategoryLabels,
} from "@/lib/data/products";

interface ProductDetailProps {
  product: Product;
  previewMode?: boolean;
}

function getPickupHeading(product: Product) {
  if (product.pickup_summary) {
    return product.pickup_summary;
  }

  if (product.pickup_only) {
    return "Recogida en Nova Forza Gym";
  }

  return "Consulta disponibilidad";
}

function getPickupCopy(product: Product) {
  if (product.pickup_eta) {
    return product.pickup_eta;
  }

  if (product.pickup_note) {
    return product.pickup_note;
  }

  return "Tu pedido queda reservado para recepcion y confirmacion directa con el club.";
}

export default function ProductDetail({
  product,
  previewMode = false,
}: Readonly<ProductDetailProps>) {
  const stockMeta = getProductStockMeta(product.stock_status);
  const comparePrice = product.compare_price ?? null;
  const showComparePrice = comparePrice !== null && comparePrice > product.price;
  const benefitItems = product.benefits?.length ? product.benefits : product.highlights;
  const usageItems = product.usage_steps?.length
    ? product.usage_steps
    : ["Consulta al equipo del club para integrar este producto en tu plan de entrenamiento."];
  const specificationItems = product.specifications?.length
    ? product.specifications
    : [
        { label: "Categoria", value: productCategoryLabels[product.category] },
        { label: "Disponibilidad", value: stockMeta.label },
        { label: "Recogida", value: product.pickup_only ? "Sede Central" : "En Sala" },
      ];

  return (
    <section className={previewMode ? "py-0" : "section-shell py-12 md:py-20"}>
      {!previewMode ? (
        <nav
          aria-label="Breadcrumb"
          className="mb-12 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87]"
        >
          <Link href="/" className="transition hover:text-[#d71920]">
            INICIO
          </Link>
          <span className="text-black/10">/</span>
          <Link href="/tienda" className="transition hover:text-[#d71920]">
            TIENDA PRO
          </Link>
          <span className="text-black/10">/</span>
          <Link
            href={`/tienda?categoria=${product.category}`}
            className="transition hover:text-[#d71920]"
          >
            {productCategoryLabels[product.category].toUpperCase()}
          </Link>
          <span className="text-black/10">/</span>
          <span className="text-[#111111]">{product.name.toUpperCase()}</span>
        </nav>
      ) : (
        <div className="mb-8 inline-flex items-center bg-[#111111] px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white">
          Preview ficha PDP
        </div>
      )}

      <div
        className={
          previewMode
            ? "grid gap-12"
            : "grid gap-16 xl:grid-cols-[1fr_500px] xl:items-start"
        }
      >
        <ProductGallery name={product.name} images={product.images} />

        <div className="space-y-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 bg-[#d71920]" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#7a7f87]">
                  {product.eyebrow ?? "Equipamiento de Rendimiento"}
                </p>
              </div>
              <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tighter text-[#111111] sm:text-7xl italic">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-4">
                <p className="font-display text-5xl font-black tracking-tighter text-[#111111]">
                  {formatProductPrice(product)}
                </p>
                {showComparePrice ? (
                  <p className="text-lg font-bold text-[#9ca3af] line-through decoration-[#d71920]/40">
                    {formatProductPrice({
                      price: comparePrice,
                      currency: product.currency,
                    })}
                  </p>
                ) : null}
                {product.discount_label ? (
                  <Badge className="h-7 rounded-none border-none bg-[#d71920] px-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    {product.discount_label}
                  </Badge>
                ) : null}
              </div>
              {product.paypal_price_usd !== null ? (
                <p className="border-l-2 border-[#d71920] bg-black/5 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#7a7f87]">
                  PayPal cobra aprox. <strong>{formatUsdPrice(product.paypal_price_usd)}</strong>
                </p>
              ) : null}
            </div>

            <p className="border-l border-black/10 pl-8 text-lg font-medium leading-8 text-[#5f6368]">
              {product.description}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-10 shadow-2xl">
            <ProductPurchasePanel product={product} previewMode={previewMode} />
          </div>

          <div className="group relative overflow-hidden bg-[#111111] p-10 text-white shadow-2xl">
            <div className="relative z-10 flex items-start gap-6">
              <div className="shrink-0 bg-white p-3 text-[#111111]">
                <Store className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d71920]">
                  {getPickupHeading(product).toUpperCase()}
                </p>
                <p className="text-sm italic leading-relaxed text-white/60">
                  &ldquo;{getPickupCopy(product)}&rdquo;
                </p>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 translate-x-20 -skew-x-12 bg-white/5" />
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Badge className="h-8 rounded-none border-black/10 bg-white px-4 text-[9px] font-black uppercase tracking-widest text-[#111111] shadow-sm">
              {stockMeta.label}
            </Badge>
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                className="h-8 rounded-none border-black/5 bg-[#fbfbf8] px-4 text-[9px] font-bold uppercase tracking-widest text-[#7a7f87]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 border-t border-black/10 pt-16 md:grid-cols-3">
        <div className="group space-y-8 border border-black/10 bg-white p-10 shadow-lg transition-colors hover:border-[#111111]">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#111111] transition-colors group-hover:bg-[#d71920]">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight italic">
              Beneficios
            </h2>
          </div>
          <ul className="space-y-4">
            {benefitItems.map((item) => (
              <li key={item} className="flex items-start gap-4">
                <div className="mt-2 h-1 w-1 shrink-0 bg-[#d71920]" />
                <span className="text-sm font-medium leading-relaxed text-[#5f6368]">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="group space-y-8 border border-black/10 bg-white p-10 shadow-lg transition-colors hover:border-[#111111]">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#111111] transition-colors group-hover:bg-[#d71920]">
              <TimerReset className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight italic">
              Como usar
            </h2>
          </div>
          <div className="space-y-4 text-sm font-medium italic leading-relaxed text-[#5f6368]">
            {usageItems.map((item) => (
              <p key={item} className="border-l-2 border-black/5 pl-6">
                &ldquo;{item}&rdquo;
              </p>
            ))}
          </div>
        </div>

        <div className="group space-y-8 border border-black/10 bg-white p-10 shadow-lg transition-colors hover:border-[#111111]">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#111111] transition-colors group-hover:bg-[#d71920]">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-display text-xl font-black uppercase tracking-tight italic">
              Especificaciones
            </h2>
          </div>
          <dl className="space-y-4">
            {specificationItems.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="flex items-center justify-between gap-4 border-b border-black/5 pb-4 last:border-0"
              >
                <dt className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
                  {item.label}
                </dt>
                <dd className="text-xs font-bold uppercase text-[#111111]">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
