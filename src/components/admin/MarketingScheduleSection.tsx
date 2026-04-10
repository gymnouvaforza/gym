"use client";

import { AlertCircle, ArrowDown, ArrowUp, Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn, type UseFormSetValue } from "react-hook-form";

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
import type { MarketingScheduleValues } from "@/lib/validators/marketing";
import { cn } from "@/lib/utils";

interface MarketingScheduleSectionProps {
  form: UseFormReturn<MarketingScheduleValues>;
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

function createScheduleRow() {
  return {
    id: createId(),
    label: "",
    description: "",
    opens_at: "",
    closes_at: "",
    is_active: true,
    order: 0,
  };
}

function syncScheduleOrders(
  setValue: UseFormSetValue<MarketingScheduleValues>,
  nextRows: MarketingScheduleValues["scheduleRows"],
) {
  nextRows.forEach((_, index) => {
    setValue(`scheduleRows.${index}.order`, index, { shouldDirty: true });
  });
}

function moveArrayItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function MarketingScheduleSection({
  form,
  disabledReason,
  isPending,
}: Readonly<MarketingScheduleSectionProps>) {
  const [openSchedules, setOpenSchedules] = useState<Record<string, boolean>>({ "0": true });

  const scheduleFields = useFieldArray({
    control: form.control,
    name: "scheduleRows",
  });

  const watchedScheduleRows = useWatch({ control: form.control, name: "scheduleRows" }) ?? [];

  useEffect(() => {
    if (form.formState.submitCount <= 0) {
      return;
    }

    const scheduleIndexesToOpen = Object.keys(form.formState.errors.scheduleRows ?? {})
      .map((key) => Number.parseInt(key, 10))
      .filter((index) => !Number.isNaN(index));

    if (scheduleIndexesToOpen.length === 0) {
      return;
    }

    queueMicrotask(() => {
      setOpenSchedules((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const index of scheduleIndexesToOpen) {
          if (!next[index]) {
            next[index] = true;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    });
  }, [form.formState.submitCount, form.formState.errors.scheduleRows]);

  function toggleSchedule(idx: number) {
    setOpenSchedules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  function handleMoveScheduleRow(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= watchedScheduleRows.length) {
      return;
    }

    const nextRows = moveArrayItem(watchedScheduleRows, index, nextIndex);
    scheduleFields.move(index, nextIndex);
    syncScheduleOrders(form.setValue, nextRows);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          {form.formState.errors.scheduleRows?.message && (
            <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {String(form.formState.errors.scheduleRows.message)}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || Boolean(disabledReason)}
          onClick={() => scheduleFields.append({ ...createScheduleRow(), order: watchedScheduleRows.length })}
        >
          <Plus className="h-4 w-4" />
          Anadir fila
        </Button>
      </div>

      <div className="space-y-4">
        {scheduleFields.fields.map((field, index) => {
          const isOpen = openSchedules[index] ?? false;
          const rowValue = watchedScheduleRows[index];
          const hasError = !!form.formState.errors.scheduleRows?.[index];

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
                onClick={() => toggleSchedule(index)}
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
                        {rowValue?.label || `Fila ${index + 1}`}
                      </span>
                      {(rowValue?.opens_at || rowValue?.closes_at) && (
                        <span className="text-xs text-[#5f6368]">
                          • {rowValue.opens_at} - {rowValue.closes_at}
                        </span>
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
                          rowValue?.is_active ? "bg-emerald-500" : "bg-zinc-400",
                        )}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-[#7a7f87]">
                        {rowValue?.is_active ? "Activo" : "Oculto"}
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
                      onClick={() => handleMoveScheduleRow(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending || index === scheduleFields.fields.length - 1}
                      onClick={() => handleMoveScheduleRow(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isPending || Boolean(disabledReason) || scheduleFields.fields.length === 1}
                    onClick={() => {
                      scheduleFields.remove(index);
                      const nextRows = form.getValues("scheduleRows");
                      syncScheduleOrders(form.setValue, nextRows);
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
                  <div className="bg-white/50 p-2 border border-black/5">
                     <p className="text-xs font-semibold uppercase tracking-widest text-[#7a7f87]">
                       Configuracion de Fila {index + 1}
                     </p>
                  </div>

                  <FormField
                    control={form.control}
                    name={`scheduleRows.${index}.label`}
                    render={({ field: rowField, fieldState }) => (
                      <FormItem>
                        <FormLabel className={cn(fieldState.error && "text-red-500")}>Titulo</FormLabel>
                        <FormControl>
                          <Input placeholder="Lunes - Viernes" {...rowField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`scheduleRows.${index}.description`}
                    render={({ field: rowField, fieldState }) => (
                      <FormItem>
                        <FormLabel className={cn(fieldState.error && "text-red-500")}>Descripcion corta</FormLabel>
                        <FormControl>
                          <Textarea rows={2} placeholder="Opcional." {...rowField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`scheduleRows.${index}.opens_at`}
                      render={({ field: rowField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Apertura</FormLabel>
                          <FormControl>
                            <Input placeholder="05:00 AM" {...rowField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`scheduleRows.${index}.closes_at`}
                      render={({ field: rowField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Cierre</FormLabel>
                          <FormControl>
                            <Input placeholder="11:00 PM" {...rowField} className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`scheduleRows.${index}.is_active`}
                    render={({ field: rowField }) => (
                      <FormItem>
                        <FormLabel>Visibilidad</FormLabel>
                        <FormControl>
                          <button
                            type="button"
                            disabled={isPending || Boolean(disabledReason)}
                            onClick={() => rowField.onChange(!rowField.value)}
                            className={cn(
                              "flex h-10 w-full items-center justify-center gap-2 border px-4 text-xs font-semibold transition",
                              rowField.value
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-50 text-zinc-600",
                            )}
                          >
                            {rowField.value ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                            {rowField.value ? "Activo en web" : "Oculto en web"}
                          </button>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
