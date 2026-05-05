"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { useDeferredValue, useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { useFormDraft } from "@/hooks/admin/use-form-draft";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveStoreProduct } from "@/app/(admin)/dashboard/tienda/actions";
import {
  buildStoreProductPreview,
  type StoreCategory,
  type StoreDashboardProduct,
} from "@/lib/data/store";
import { storeProductSchema, type StoreProductInput } from "@/lib/validators/store";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AdminSurface from "./AdminSurface";
import StoreProductPreview from "./StoreProductPreview";
import { cn } from "@/lib/utils";

// Domain Specific Imports
import { toStoreFormValues } from "@/features/admin/store/services/store-mappers";
import { StoreProductIdentitySection } from "@/features/admin/store/components/StoreProductIdentitySection";
import { StoreProductPricingSection } from "@/features/admin/store/components/StoreProductPricingSection";
import { StoreProductContentSection } from "@/features/admin/store/components/StoreProductContentSection";
import { StoreProductPickupSection } from "@/features/admin/store/components/StoreProductPickupSection";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";

interface StoreProductFormProps {
  product?: StoreDashboardProduct | null;
  categories: StoreCategory[];
  disabledReason?: string;
}

export default function StoreProductForm({
  product,
  categories,
  disabledReason,
}: Readonly<StoreProductFormProps>) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<StoreProductInput>({
    resolver: zodResolver(storeProductSchema),
    defaultValues: toStoreFormValues(product),
  });

  const draft = useFormDraft<StoreProductInput>({
    formKey: "store-product",
    recordId: product?.id ?? "new",
    form,
  });

  const watchedValues = useWatch({ control: form.control }) as StoreProductInput;
  const previewValues = watchedValues ?? toStoreFormValues(product);
  const deferredPreviewValues = useDeferredValue(previewValues);
  
  const previewProduct = useMemo(
    () => buildStoreProductPreview(deferredPreviewValues, categories, product),
    [categories, deferredPreviewValues, product],
  );

  function onSubmit(values: StoreProductInput) {
    startTransition(async () => {
      try {
        await saveStoreProduct(values, product?.id);
        await draft.clearDraft();
        toast.success(product ? "Producto actualizado en el catálogo." : "Producto publicado oficialmente.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error crítico al guardar el producto.");
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-8 xl:grid-cols-[minmax(0,1.32fr)_minmax(360px,0.95fr)]"
      >
        <div className="space-y-12">
          {/* Banner de Borradores */}
          {draft.hasDraft && (
            <Alert className="border-amber-200 bg-amber-50 shadow-sm rounded-xl">
              <RotateCcw className="h-4 w-4 text-amber-600 animate-spin-slow" />
              <AlertDescription className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                  Recuperación: Tienes un borrador activo.
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={draft.applyDraft} className="h-7 text-[9px] font-black uppercase border-amber-300 bg-white hover:bg-amber-100">
                    Restaurar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={draft.clearDraft} className="h-7 text-[9px] font-black uppercase text-amber-700">
                    Descartar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <StoreProductIdentitySection categories={categories} />
          <StoreProductPricingSection />
          <StoreProductPickupSection />
          <StoreProductContentSection isPending={isPending} disabledReason={disabledReason} />

          <div className="grid gap-6 md:grid-cols-2 border-t border-black/5 pt-10">
            <AdminFormCheckbox name="featured" label="Producto destacado en Portada" />
            <AdminFormCheckbox name="active" label="Visible en Catálogo Activo" />
          </div>

          <AdminSurface className="sticky bottom-6 z-10 border-black/5 bg-white/90 p-5 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
                {disabledReason ? (
                  <span className="text-[#d71920]">{disabledReason}</span>
                ) : (
                  "ESTADO: " + (product ? "EDICIÓN ACTIVA" : "CREACIÓN DE NUEVO ITEM")
                )}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={draft.isSaving || isPending}
                  onClick={() => {
                    draft.saveDraft();
                    toast.info("Borrador guardado localmente.");
                  }}
                  className="h-12 px-6 border-black/10 font-black uppercase tracking-[0.2em] text-[#7a7f87] rounded-xl hover:bg-black/5 transition-all"
                >
                  {draft.isSaving ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {draft.isSaving ? "Guardando..." : "Guardar borrador"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending || draft.isSaving || Boolean(disabledReason)}
                  className={cn(
                    "h-12 px-8 text-white font-black uppercase tracking-[0.25em] transition-all duration-500 rounded-xl shadow-lg",
                    isPending ? "bg-black/40 text-white/50" : "bg-[#111111] hover:bg-[#d71920] hover:shadow-red-500/20"
                  )}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="size-4" />
                      <span>{product ? "Actualizar Catálogo" : "Publicar Artículo"}</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </AdminSurface>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <StoreProductPreview product={previewProduct} persistedSlug={product?.slug ?? null} />
        </aside>
      </form>
    </Form>
  );
}
