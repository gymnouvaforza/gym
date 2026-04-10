"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { saveMarketingSchedule } from "@/app/(admin)/dashboard/actions";
import AdminSurface from "@/components/admin/AdminSurface";
import MarketingScheduleSection from "@/components/admin/MarketingScheduleSection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { MarketingScheduleRow } from "@/lib/data/marketing-content";
import {
  marketingScheduleSchema,
  type MarketingScheduleValues,
} from "@/lib/validators/marketing";

interface MarketingScheduleFormProps {
  scheduleRows: MarketingScheduleRow[];
  disabledReason?: string;
}

export default function MarketingScheduleForm({
  scheduleRows,
  disabledReason,
}: Readonly<MarketingScheduleFormProps>) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MarketingScheduleValues>({
    resolver: zodResolver(marketingScheduleSchema),
    defaultValues: {
      scheduleRows: scheduleRows.map((row) => ({
        id: row.id,
        label: row.label,
        description: row.description ?? "",
        opens_at: row.opens_at,
        closes_at: row.closes_at,
        is_active: row.is_active,
        order: row.order,
      })),
    },
  });

  const hasErrors = !!form.formState.errors.scheduleRows;

  function onSubmit(values: MarketingScheduleValues) {
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await saveMarketingSchedule(values.scheduleRows);
        
        if (result.success) {
          form.reset(values);
          setFeedback("Horarios actualizados correctamente.");
        } else {
          setFeedback(result.error || "Error al guardar los horarios.");
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Error fatal al guardar.");
      }
    });
  }

  return (
    <AdminSurface className="border border-black/8 bg-[#fbfbf8] p-5">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#111111]">Horarios</h3>
          <p className="mt-1 text-sm text-[#5f6368]">
            Gestiona los horarios de apertura y cierre visibles en la web.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MarketingScheduleSection 
            form={form} 
            isPending={isPending} 
            disabledReason={disabledReason} 
          />

          <div className="flex flex-col gap-3 border-t border-black/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm text-[#5f6368]" aria-live="polite">
                {isPending
                  ? "Guardando horarios..."
                  : feedback ?? disabledReason ?? "Edita los horarios y guarda para publicar."}
              </p>
              {hasErrors && (
                <div className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Hay errores de validacion en los horarios.
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className="w-full sm:w-auto px-6"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar horarios
            </Button>
          </div>
        </form>
      </Form>
    </AdminSurface>
  );
}
