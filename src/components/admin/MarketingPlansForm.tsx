"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { saveMarketingPlans } from "@/app/(admin)/dashboard/actions";
import AdminSurface from "@/components/admin/AdminSurface";
import MarketingPlansSection from "@/components/admin/MarketingPlansSection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { MarketingPlan } from "@/lib/data/marketing-content";
import {
  marketingPlansSchema,
  type MarketingPlansValues,
} from "@/lib/validators/marketing";

interface MarketingPlansFormProps {
  plans: MarketingPlan[];
  disabledReason?: string;
}

export default function MarketingPlansForm({
  plans,
  disabledReason,
}: Readonly<MarketingPlansFormProps>) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MarketingPlansValues>({
    resolver: zodResolver(marketingPlansSchema),
    defaultValues: {
      plans: plans.map((plan) => ({
        id: plan.id,
        title: plan.title,
        description: plan.description ?? "",
        price_label: plan.price_label,
        billing_label: plan.billing_label,
        badge: plan.badge ?? "",
        is_featured: plan.is_featured,
        is_active: plan.is_active,
        order: plan.order,
        features: plan.features.map((feature) => ({
          label: feature.label,
          included: feature.included,
        })),
      })),
    },
  });

  const hasErrors = !!form.formState.errors.plans;

  function onSubmit(values: MarketingPlansValues) {
    setFeedback(null);

    const normalizedValues: MarketingPlansValues = {
      plans: values.plans.map((plan, index) => ({
        ...plan,
        order: index,
      })),
    };

    startTransition(async () => {
      try {
        const result = await saveMarketingPlans(normalizedValues.plans);
        
        if (result.success) {
          form.reset(normalizedValues);
          setFeedback("Planes actualizados correctamente.");
        } else {
          setFeedback(result.error || "Error al guardar los planes.");
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
          <h3 className="text-lg font-semibold text-[#111111]">Planes</h3>
          <p className="mt-1 text-sm text-[#5f6368]">
            Gestiona los planes de suscripción y sus características principales.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MarketingPlansSection 
            form={form} 
            isPending={isPending} 
            disabledReason={disabledReason} 
          />

          <div className="flex flex-col gap-3 border-t border-black/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm text-[#5f6368]" aria-live="polite">
                {isPending
                  ? "Guardando cambios..."
                  : feedback ?? disabledReason ?? "Edita los planes y guarda para publicar."}
              </p>
              {hasErrors && (
                <div className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Hay errores de validacion en los planes.
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className="w-full sm:w-auto px-6"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar planes
            </Button>
          </div>
        </form>
      </Form>
    </AdminSurface>
  );
}
