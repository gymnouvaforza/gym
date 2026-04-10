"use client";

import { ArrowDown, ArrowUp, Check, ChevronDown, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch, type Control, type UseFormReturn, type UseFormSetValue } from "react-hook-form";

import AdminSurface from "@/components/admin/AdminSurface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MarketingPlansValues } from "@/lib/validators/marketing";
import { cn } from "@/lib/utils";

interface MarketingPlansSectionProps {
  form: UseFormReturn<MarketingPlansValues>;
  disabledReason?: string;
  isPending: boolean;
}

function createId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createPlan() {
  return {
    id: createId(),
    title: "",
    description: "",
    price_label: "",
    billing_label: "/mes",
    badge: "",
    is_featured: false,
    is_active: true,
    order: 0,
    features: [{ label: "", included: true }],
  };
}

function syncPlanOrders(
  setValue: UseFormSetValue<MarketingPlansValues>,
  nextPlans: MarketingPlansValues["plans"],
) {
  nextPlans.forEach((_, index) => {
    setValue(`plans.${index}.order`, index, { shouldDirty: true });
  });
}

function moveArrayItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

interface PlanFeaturesEditorProps {
  control: Control<MarketingPlansValues>;
  planIndex: number;
  disabled: boolean;
}

function PlanFeaturesEditor({ control, planIndex, disabled }: Readonly<PlanFeaturesEditorProps>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `plans.${planIndex}.features`,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
          Caracteristicas
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => append({ label: "", included: true })}
        >
          <Plus className="h-4 w-4" />
          Anadir linea
        </Button>
      </div>

      <div className="space-y-3">
        {fields.length === 0 && (
          <p className="py-2 text-center text-xs text-[#8c9198]">
            No hay caracteristicas. Pulsa &quot;Anadir linea&quot;.
          </p>
        )}
        {fields.map((field, featureIndex) => (
          <div
            key={field.id}
            className="grid gap-3 rounded-none border border-black/8 bg-[#fbfbf8] p-3 md:grid-cols-[minmax(0,1fr)_140px_auto]"
          >
            <FormField
              control={control}
              name={`plans.${planIndex}.features.${featureIndex}.label`}
              render={({ field: featureField, fieldState }) => (
                <FormItem>
                  <FormLabel className={cn(fieldState.error && "text-red-500")}>Texto</FormLabel>
                  <FormControl>
                    <Input {...featureField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`plans.${planIndex}.features.${featureIndex}.included`}
              render={({ field: featureField }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => featureField.onChange(!featureField.value)}
                      className={cn(
                        "flex h-12 w-full items-center justify-center gap-2 border px-4 text-sm font-semibold transition",
                        featureField.value
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-zinc-200 bg-zinc-50 text-zinc-600",
                      )}
                    >
                      {featureField.value ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      {featureField.value ? "Incluida" : "No incluida"}
                    </button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || fields.length === 1}
                onClick={() => remove(featureIndex)}
              >
                <Trash2 className="h-4 w-4" />
                Quitar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarketingPlansSection({
  form,
  disabledReason,
  isPending,
}: Readonly<MarketingPlansSectionProps>) {
  const [openPlans, setOpenPlans] = useState<Record<string, boolean>>({ "0": true });

  const planFields = useFieldArray({
    control: form.control,
    name: "plans",
  });

  const watchedPlans = useWatch({ control: form.control, name: "plans" }) ?? [];

  useEffect(() => {
    if (form.formState.submitCount <= 0) {
      return;
    }

    const planIndexesToOpen = Object.keys(form.formState.errors.plans ?? {})
      .map((key) => Number.parseInt(key, 10))
      .filter((index) => !Number.isNaN(index));

    if (planIndexesToOpen.length === 0) {
      return;
    }

    queueMicrotask(() => {
      setOpenPlans((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const index of planIndexesToOpen) {
          if (!next[index]) {
            next[index] = true;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    });
  }, [form.formState.submitCount, form.formState.errors.plans]);

  function togglePlan(idx: number) {
    setOpenPlans((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  function handleMovePlan(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= watchedPlans.length) {
      return;
    }

    const nextPlans = moveArrayItem(watchedPlans, index, nextIndex);
    planFields.move(index, nextIndex);
    syncPlanOrders(form.setValue, nextPlans);
  }

  function handleFeaturedPlan(index: number) {
    watchedPlans.forEach((_, currentIndex) => {
      form.setValue(`plans.${currentIndex}.is_featured`, currentIndex === index, {
        shouldDirty: true,
      });
    });
  }

  return (
    <div className="space-y-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || Boolean(disabledReason)}
          onClick={() => {
            const nextPlans = [...watchedPlans, { ...createPlan(), order: watchedPlans.length }];
            planFields.append(nextPlans[nextPlans.length - 1]);
          }}
        >
          <Plus className="h-4 w-4" />
          Añadir plan
        </Button>

      <div className="space-y-4">
        {planFields.fields.map((field, index) => {
          const isOpen = openPlans[index] ?? false;
          const planValue = watchedPlans[index];
          const hasError = !!form.formState.errors.plans?.[index];

          return (
            <AdminSurface
              key={field.id}
              inset
              className={cn(
                "overflow-hidden border bg-[#fbfbf8]",
                hasError ? "border-red-200" : "border-black/8"
              )}
            >
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-black/2",
                  !isOpen && "bg-[#fcfcfa]",
                  hasError && !isOpen && "bg-red-50/30"
                )}
                onClick={() => togglePlan(index)}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center border text-xs font-bold",
                    hasError 
                      ? "border-red-200 bg-red-50 text-red-600" 
                      : "border-black/8 bg-white text-[#111111]"
                  )}>
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        "truncate text-sm font-semibold",
                        hasError ? "text-red-700" : "text-[#111111]"
                      )}>
                        {planValue?.title || `Plan ${index + 1}`}
                      </span>
                      {planValue?.price_label && (
                        <span className="text-xs text-[#5f6368]">
                          • {planValue.price_label}
                          {planValue.billing_label}
                        </span>
                      )}
                      {planValue?.is_featured && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      )}
                      {hasError && (
                        <Badge
                          variant="default"
                          className="h-5 rounded-none border-red-200 bg-red-50 px-2 py-0 text-[8px] font-black uppercase tracking-widest text-red-700"
                        >
                          ERROR
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          planValue?.is_active ? "bg-emerald-500" : "bg-zinc-400",
                        )}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-[#7a7f87]">
                        {planValue?.is_active ? "Activo" : "Oculto"}
                        {planValue?.badge && ` • ${planValue.badge}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="hidden sm:flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending || index === 0}
                      onClick={() => handleMovePlan(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending || index === planFields.fields.length - 1}
                      onClick={() => handleMovePlan(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isPending || Boolean(disabledReason) || planFields.fields.length === 1}
                    onClick={() => {
                      planFields.remove(index);
                      const nextPlans = form.getValues("plans");
                      syncPlanOrders(form.setValue, nextPlans);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500/70" />
                  </Button>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-[#a1a1a1] transition-transform",
                      isOpen && "rotate-180",
                      hasError && "text-red-500"
                    )}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-black/6 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white/50 p-2 border border-black/5">
                     <p className="text-xs font-semibold uppercase tracking-widest text-[#7a7f87]">
                       Configuracion de Plan {index + 1}
                     </p>
                     <Button
                      type="button"
                      variant={watchedPlans[index]?.is_featured ? "secondary" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      disabled={isPending || Boolean(disabledReason)}
                      onClick={() => handleFeaturedPlan(index)}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      {watchedPlans[index]?.is_featured ? "Plan Destacado" : "Hacer Destacado"}
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`plans.${index}.title`}
                      render={({ field: planField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Nombre</FormLabel>
                          <FormControl>
                            <Input {...planField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`plans.${index}.badge`}
                      render={({ field: planField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Badge</FormLabel>
                          <FormControl>
                            <Input placeholder="Recomendado" {...planField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`plans.${index}.description`}
                    render={({ field: planField, fieldState }) => (
                      <FormItem>
                        <FormLabel className={cn(fieldState.error && "text-red-500")}>Descripcion corta</FormLabel>
                        <FormControl>
                          <Textarea rows={2} placeholder="Texto comercial opcional." {...planField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`plans.${index}.price_label`}
                      render={({ field: planField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Precio visible</FormLabel>
                          <FormControl>
                            <Input placeholder="S/150" {...planField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`plans.${index}.billing_label`}
                      render={({ field: planField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Periodo</FormLabel>
                          <FormControl>
                            <Input placeholder="/mes" {...planField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`plans.${index}.is_active`}
                      render={({ field: planField }) => (
                        <FormItem>
                          <FormLabel>Visibilidad</FormLabel>
                          <FormControl>
                            <button
                              type="button"
                              disabled={isPending || Boolean(disabledReason)}
                              onClick={() => planField.onChange(!planField.value)}
                              className={cn(
                                "flex h-10 w-full items-center justify-center gap-2 border px-4 text-xs font-semibold transition",
                                planField.value
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-600",
                              )}
                            >
                              {planField.value ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              {planField.value ? "Activo en web" : "Oculto en web"}
                            </button>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <AdminSurface className="flex items-center justify-between border-black/8 bg-white p-3">
                      <div>
                        <p className="text-xs font-semibold text-[#111111]">Plan destacado</p>
                        <p className="mt-1 text-[11px] text-[#5f6368]">
                          Solo uno se ve como recomendado.
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                          watchedPlans[index]?.is_featured
                            ? "bg-[#111111] text-white"
                            : "bg-[#f3f4f6] text-[#6b7280]",
                        )}
                      >
                        {watchedPlans[index]?.is_featured ? "Activo" : "Normal"}
                      </div>
                    </AdminSurface>
                  </div>

                  <PlanFeaturesEditor
                    control={form.control}
                    planIndex={index}
                    disabled={isPending || Boolean(disabledReason)}
                  />
                </div>
              )}
            </AdminSurface>
          );
        })}
      </div>
    </div>
  );
}
