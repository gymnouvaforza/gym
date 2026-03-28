"use client";

import Link from "next/link";
import { ExternalLink, Eye, LayoutTemplate } from "lucide-react";
import { useMemo, useState } from "react";

import ProductCard from "@/components/marketing/ProductCard";
import ProductDetail from "@/components/marketing/ProductDetail";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/types";
import { cn, slugify } from "@/lib/utils";

import AdminSurface from "./AdminSurface";

type PreviewMode = "card" | "detail";

interface StoreProductPreviewProps {
  product: Product;
  persistedSlug?: string | null;
}

const previewModes: Array<{ value: PreviewMode; label: string; icon: typeof LayoutTemplate }> = [
  { value: "card", label: "Tarjeta", icon: LayoutTemplate },
  { value: "detail", label: "Ficha", icon: Eye },
];

export default function StoreProductPreview({
  product,
  persistedSlug,
}: Readonly<StoreProductPreviewProps>) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("card");
  const draftSlug = useMemo(() => slugify(product.slug || product.name), [product.name, product.slug]);
  const storefrontHref = persistedSlug ? `/tienda/${persistedSlug}` : null;
  const hasUnsavedSlugChange = Boolean(persistedSlug && draftSlug && persistedSlug !== draftSlug);

  return (
    <AdminSurface className="overflow-hidden border-black/10 bg-[#f8f5ef]">
      <div className="flex flex-col gap-4 border-b border-black/8 bg-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 border border-black/10 bg-[#fff7f7] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d71920]">
                <Eye className="h-3.5 w-3.5" />
                Preview viva
              </span>
              {!persistedSlug ? (
                <span className="inline-flex items-center border border-[#ddd5ca] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6b7280]">
                  Borrador sin guardar
                </span>
              ) : null}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#111111]">
                Como se vera en tienda
              </h3>
              <p className="max-w-md text-sm leading-6 text-[#5f6368]">
                La preview se actualiza mientras editas. El storefront real solo se abre cuando la
                ficha ya existe publicada.
              </p>
            </div>
          </div>

          {storefrontHref ? (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={storefrontHref} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Abrir en storefront
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="shrink-0" disabled>
              <ExternalLink className="h-4 w-4" />
              Guarda para abrir la ficha real
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {previewModes.map(({ value, label, icon: Icon }) => {
            const isActive = previewMode === value;

            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setPreviewMode(value)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 border px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition",
                  isActive
                    ? "border-[#d71920] bg-white text-[#d71920]"
                    : "border-black/10 bg-[#fbf8f3] text-[#6b7280] hover:border-[#d71920]/35 hover:text-[#111111]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <p className="text-xs leading-5 text-[#6b7280]">
          {storefrontHref
            ? hasUnsavedSlugChange
              ? "El enlace abre la ficha publicada actual. Guarda para reflejar el nuevo slug."
              : "El enlace abre la ficha publicada actual del producto."
            : "Todavia no hay ruta real en tienda para este borrador."}
        </p>
      </div>

      <div className="bg-[#f8f5ef] p-4 sm:p-5">
        <div className="max-h-[calc(100vh-10rem)] overflow-auto pr-1">
          {previewMode === "card" ? (
            <div className="mx-auto max-w-[420px]">
              <div className="pointer-events-none">
                <ProductCard product={product} />
              </div>
            </div>
          ) : (
            <div className="pointer-events-none">
              <ProductDetail product={product} previewMode />
            </div>
          )}
        </div>
      </div>
    </AdminSurface>
  );
}
