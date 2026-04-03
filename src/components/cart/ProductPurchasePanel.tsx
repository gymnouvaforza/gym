"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/data/types";
import { formatUsdPrice } from "@/lib/data/products";

interface ProductPurchasePanelProps {
  product: Product;
  previewMode?: boolean;
}

function resolveInitialOptionValue(product: Product) {
  if ((product.variants?.length ?? 0) <= 1) {
    return product.options?.[0]?.values[0] ?? null;
  }

  return null;
}

function PreviewProductPurchasePanel({ product }: Readonly<Pick<ProductPurchasePanelProps, "product">>) {
  const primaryOption = product.options?.[0];
  const previewOptionValue = primaryOption?.values[0] ?? product.name;

  return (
    <div className="space-y-10">
      {primaryOption ? (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87]">
            {primaryOption.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {primaryOption.values.map((value, index) => {
              const isSelected = value === previewOptionValue || (!previewOptionValue && index === 0);

              return (
                <span
                  key={`${primaryOption.id}-${value}`}
                  className={cn(
                    "inline-flex h-12 items-center border px-6 text-[11px] font-black uppercase tracking-widest transition-all",
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-white shadow-lg"
                      : "border-black/10 bg-white text-[#7a7f87]"
                  )}
                >
                  {value}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87]">Cantidad</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="inline-flex h-14 w-fit items-center border border-black/10 bg-white shadow-sm">
            <span className="flex h-full w-14 items-center justify-center text-black/20">
              <Minus className="h-4 w-4" />
            </span>
            <span className="flex h-full min-w-14 items-center justify-center border-x border-black/10 px-6 text-sm font-bold text-[#111111] font-mono">
              01
            </span>
            <span className="flex h-full w-14 items-center justify-center text-black/20">
              <Plus className="h-4 w-4" />
            </span>
          </div>

          <Button
            type="button"
            className="h-14 rounded-none bg-[#d71920] px-10 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl opacity-50 cursor-not-allowed flex-1 sm:flex-none"
            disabled
          >
            DISPONIBLE EN WEB
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-black/5">
         <p className="text-[10px] font-bold text-[#7a7f87] leading-relaxed uppercase tracking-wider italic">
            * Vista previa de configuración. El proceso de compra real se activa en la versión de producción.
         </p>
      </div>
    </div>
  );
}

function InteractiveProductPurchasePanel({ product }: Readonly<Pick<ProductPurchasePanelProps, "product">>) {
  const { addItem, isBusy, error } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptionValue, setSelectedOptionValue] = useState<string | null>(
    resolveInitialOptionValue(product),
  );
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const primaryOption = product.options?.[0];
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const hasMultipleRealVariants = variants.length > 1;

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) {
      return null;
    }

    if (variants.length === 1) {
      return variants[0];
    }

    return (
      variants.find((variant) =>
        variant.options.some((option) => option.value === selectedOptionValue),
      ) ?? null
    );
  }, [selectedOptionValue, variants]);

  const isUnavailable =
    product.stock_status === "out_of_stock" || product.stock_status === "coming_soon";
  const maxQuantity =
    selectedVariant?.inventory_quantity && selectedVariant.inventory_quantity > 0
      ? Math.min(selectedVariant.inventory_quantity, 10)
      : 10;

  async function handleAddToCart() {
    if (!selectedVariant?.id) {
      setSelectionError("Selecciona una variante antes de añadir al carrito.");
      return;
    }

    setSelectionError(null);
    await addItem({
      variantId: selectedVariant.id,
      quantity,
    });
  }

  return (
    <div className="space-y-10">
      {primaryOption ? (
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87]">
            Seleccionar {primaryOption.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {primaryOption.values.map((value, index) => {
              const isSelected =
                selectedOptionValue === value ||
                (!selectedOptionValue && index === 0 && !hasMultipleRealVariants);

              return (
                <button
                  key={`${primaryOption.id}-${value}`}
                  type="button"
                  className={cn(
                    "inline-flex h-12 items-center border px-6 text-[11px] font-black uppercase tracking-widest transition-all",
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-white shadow-lg translate-y-[-2px]"
                      : "border-black/10 bg-white text-[#7a7f87] hover:border-[#d71920]/40 hover:text-[#111111]"
                  )}
                  onClick={() => {
                    setSelectedOptionValue(value);
                    setSelectionError(null);
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a7f87]">Cantidad</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <div className="inline-flex h-14 w-fit items-center border border-black/10 bg-white shadow-sm">
            <button
              type="button"
              aria-label="Reducir"
              className="flex h-full w-14 items-center justify-center text-[#111111] hover:bg-[#fbfbf8] transition-colors disabled:opacity-20"
              disabled={isBusy || quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-full min-w-14 items-center justify-center border-x border-black/10 px-6 text-sm font-bold text-[#111111] font-mono">
              {quantity.toString().padStart(2, '0')}
            </span>
            <button
              type="button"
              aria-label="Aumentar"
              className="flex h-full w-14 items-center justify-center text-[#111111] hover:bg-[#fbfbf8] transition-colors disabled:opacity-20"
              disabled={isBusy || quantity >= maxQuantity}
              onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            className="h-14 rounded-none bg-[#d71920] px-12 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#111111] transition-all shadow-xl flex-1 sm:flex-none"
            disabled={isBusy || isUnavailable || (hasMultipleRealVariants && !selectedVariant)}
            onClick={() => {
              void handleAddToCart();
            }}
          >
            {isUnavailable ? "AGOTADO" : isBusy ? "PROCESANDO..." : "AÑADIR AL CARRITO"}
          </Button>
        </div>
      </div>

      {(selectionError || error) && (
        <div className="p-4 bg-red-50 border-l-2 border-red-600">
           <p className="text-[10px] font-black uppercase text-red-700 tracking-widest">{selectionError || error}</p>
        </div>
      )}
    </div>
  );
}

export default function ProductPurchasePanel({
  product,
  previewMode = false,
}: Readonly<ProductPurchasePanelProps>) {
  if (previewMode) {
    return <PreviewProductPurchasePanel product={product} />;
  }

  return <InteractiveProductPurchasePanel product={product} />;
}
