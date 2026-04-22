"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, FolderTree, Tag, AlignLeft, Hash, LayoutList, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { saveStoreCategory } from "@/app/(admin)/dashboard/tienda/actions";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";
import { NFCard } from "@/components/system/nf-card";
import { NFField } from "@/components/system/nf-field";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toStoreCategoryFormValues, type StoreCategory } from "@/lib/data/store";
import { cn } from "@/lib/utils";
import { storeCategorySchema, type StoreCategoryInput } from "@/lib/validators/store";

interface StoreCategoryFormProps {
  category?: StoreCategory | null;
  categories: StoreCategory[];
  disabledReason?: string;
}

const NO_PARENT_VALUE = "__none__";

export default function StoreCategoryForm({
  category,
  categories,
  disabledReason,
}: Readonly<StoreCategoryFormProps>) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<StoreCategoryInput>({
    resolver: zodResolver(storeCategorySchema),
    defaultValues: toStoreCategoryFormValues(category),
  });

  const currentOrder = useWatch({
    control: form.control,
    name: "order",
  });

  const parentOptions = categories.filter(
    (entry) => entry.parent_id == null && entry.id !== category?.id,
  );

  function onSubmit(values: StoreCategoryInput) {
    startTransition(async () => {
      try {
        await saveStoreCategory(values, category?.id);
        toast.success(category ? "Categoría actualizada correctamente." : "Nueva categoría creada.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error crítico al guardar la categoría.");
      }
    });
  }

  return (
    <NFCard
      title="Estructura de Catálogo"
      description="Organización jerárquica y metadatos de categoría."
      className="shadow-xl shadow-black/[0.02] border-black/5"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <NFField
              name="name"
              label="Nombre de Categoría"
              placeholder="Ej: Suplementos, Equipamiento..."
              icon={FolderTree}
              tooltip="Nombre visible para los usuarios en la tienda."
              disabled={Boolean(disabledReason) || isPending}
            />
            <NFField
              name="slug"
              label="Slug (URL)"
              placeholder="Se autogenera si lo dejas vacío"
              icon={Tag}
              tooltip="Identificador único en la URL. Déjalo en blanco para auto-generarlo."
              disabled={Boolean(disabledReason) || isPending}
            />
          </div>

          <div className="pt-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2 group/label">
                    <AlignLeft className="size-3.5 text-muted-foreground/60 transition-colors group-focus-within/label:text-[#d71920]" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87] group-focus-within/label:text-[#111111] transition-colors">
                      Descripción Detallada
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      rows={3}
                      {...field}
                      disabled={Boolean(disabledReason) || isPending}
                      className="min-h-[100px] bg-black/[0.02] border-black/5 rounded-2xl px-5 py-4 font-medium text-[#111111] focus:ring-0 focus:border-[#111111] focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/20 leading-relaxed shadow-inner resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 border-t border-black/5 pt-8">
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutList className="size-3.5 text-muted-foreground/60" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87]">
                      Categoría Padre
                    </FormLabel>
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(value === NO_PARENT_VALUE ? "" : value)}
                    value={field.value || NO_PARENT_VALUE}
                    disabled={Boolean(disabledReason) || isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 bg-black/[0.02] border-black/5 rounded-xl px-4 font-bold text-[#111111] focus:ring-0 focus:border-[#111111] transition-all">
                        <SelectValue placeholder="Sin padre (categoría raíz)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-black/5 shadow-2xl">
                      <SelectItem
                        value={NO_PARENT_VALUE}
                        className="text-xs font-bold uppercase py-3 text-muted-foreground"
                      >
                        Sin padre (raíz)
                      </SelectItem>
                      {parentOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id}
                          className="text-xs font-bold uppercase py-3"
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
                </FormItem>
              )}
            />

            <NFField
              name="order"
              label="Prioridad de Orden"
              type="number"
              min={0}
              icon={Hash}
              tooltip="Número de orden para mostrar en el listado. Menor = Primero."
              disabled={Boolean(disabledReason) || isPending}
              value={typeof currentOrder === "number" ? currentOrder : 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                form.setValue("order", e.target.valueAsNumber || 0)
              }
            />
          </div>

          <div className="pt-4 border-t border-black/5">
            <AdminFormCheckbox
              name="active"
              label="Categoría Activa y Visible"
              disabled={Boolean(disabledReason) || isPending}
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-black/5 pt-8 sm:flex-row sm:items-center sm:justify-between mt-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]" aria-live="polite">
              {disabledReason ? (
                <span className="text-[#d71920]">{disabledReason}</span>
              ) : (
                "ESTADO: " + (category ? "EDICIÓN ACTIVA" : "CREACIÓN DE NUEVA CATEGORÍA")
              )}
            </p>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className={cn(
                "h-12 px-8 text-white font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-xl shadow-lg",
                isPending ? "bg-black/40 text-white/50" : "bg-[#111111] hover:bg-[#d71920] hover:shadow-red-500/20",
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 animate-spin text-white/50" />
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="size-4" />
                  <span>{category ? "Actualizar Categoría" : "Guardar Categoría"}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </NFCard>
  );
}
