"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, BadgeDollarSign, CalendarDays, Gift, Hash, Save, Snowflake } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { saveMembershipPlan } from "@/app/(admin)/dashboard/membresias/planes/actions";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";
import { NFCard } from "@/components/system/nf-card";
import { NFField } from "@/components/system/nf-field";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { MembershipPlan } from "@/lib/memberships";
import { cn } from "@/lib/utils";
import {
  membershipPlanFormSchema,
  type MembershipPlanFormInput,
  type MembershipPlanFormValues,
} from "@/lib/validators/memberships";

interface MembershipPlanFormProps {
  plan?: MembershipPlan | null;
}

function toFormValues(plan?: MembershipPlan | null): MembershipPlanFormInput {
  return {
    bonus_days: plan?.bonus_days ?? 0,
    code: plan?.code ?? "",
    description: plan?.description ?? "",
    duration_days: plan?.duration_days ?? 30,
    is_freezable: plan?.is_freezable ?? false,
    max_freeze_days: plan?.max_freeze_days ?? 0,
    price_amount: plan?.price_amount ?? 0,
    title: plan?.title ?? "",
  };
}

export default function MembershipPlanForm({ plan }: Readonly<MembershipPlanFormProps>) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<MembershipPlanFormInput, unknown, MembershipPlanFormValues>({
    resolver: zodResolver(membershipPlanFormSchema),
    defaultValues: toFormValues(plan),
  });

  const isFreezable = useWatch({ control: form.control, name: "is_freezable" });

  useEffect(() => {
    if (!Boolean(isFreezable)) {
      form.setValue("max_freeze_days", 0, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, isFreezable]);

  function onSubmit(values: MembershipPlanFormValues) {
    startTransition(async () => {
      try {
        await saveMembershipPlan(values, plan?.id);
        toast.success(plan ? "Plan actualizado correctamente." : "Plan creado correctamente.");
        if (!plan) {
          form.reset(toFormValues());
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo guardar el plan.");
      }
    });
  }

  return (
    <NFCard
      title={plan ? `Editar ${plan.title}` : "Formulario de plan"}
      description="Reglas comerciales y operativas de la membresia."
      className="border-black/5 shadow-xl shadow-black/[0.02]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <NFField
              name="code"
              label="Codigo"
              placeholder="PM-1M"
              icon={Hash}
              disabled={isPending}
            />
            <NFField
              name="title"
              label="Titulo"
              placeholder="Plan Mensual"
              icon={CalendarDays}
              disabled={isPending}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlignLeft className="size-3.5 text-muted-foreground/60" />
                  <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87]">
                    Descripcion
                  </FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    rows={3}
                    {...field}
                    value={typeof field.value === "string" ? field.value : ""}
                    disabled={isPending}
                    className="min-h-[96px] resize-none rounded-2xl border-black/5 bg-black/[0.02] px-5 py-4 font-medium leading-relaxed text-[#111111] shadow-inner transition-all placeholder:text-muted-foreground/20 focus:border-[#111111] focus:bg-white focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
              </FormItem>
            )}
          />

          <div className="grid gap-6 border-t border-black/5 pt-8 md:grid-cols-3">
            <NFField
              name="price_amount"
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              icon={BadgeDollarSign}
              disabled={isPending}
              onChange={(event) => form.setValue("price_amount", event.currentTarget.valueAsNumber || 0)}
            />
            <NFField
              name="duration_days"
              label="Duracion (dias)"
              type="number"
              min={1}
              step={1}
              icon={CalendarDays}
              disabled={isPending}
              onChange={(event) => form.setValue("duration_days", event.currentTarget.valueAsNumber || 0)}
            />
            <NFField
              name="bonus_days"
              label="Dias bonus"
              type="number"
              min={0}
              step={1}
              icon={Gift}
              disabled={isPending}
              onChange={(event) => form.setValue("bonus_days", event.currentTarget.valueAsNumber || 0)}
            />
          </div>

          <div className="space-y-5 border-t border-black/5 pt-8">
            <AdminFormCheckbox
              name="is_freezable"
              label="Permite congelamiento de membresia"
              disabled={isPending}
            />

            {Boolean(isFreezable) ? (
              <div data-testid="max-freeze-days-field" className="max-w-sm">
                <NFField
                  name="max_freeze_days"
                  label="Maximo dias congelamiento"
                  type="number"
                  min={1}
                  step={1}
                  icon={Snowflake}
                  disabled={isPending}
                  onChange={(event) =>
                    form.setValue("max_freeze_days", event.currentTarget.valueAsNumber || 0, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </div>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]">
                Sin congelamiento: el maximo se guardara como 0 dias.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-black/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]" aria-live="polite">
              {plan ? "Estado: edicion activa" : "Estado: creacion de nuevo plan"}
            </p>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "h-12 rounded-xl px-8 font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-500",
                isPending ? "bg-black/40 text-white/50" : "bg-[#111111] hover:bg-[#d71920] hover:shadow-red-500/20",
              )}
            >
              <Save className="size-4" />
              {isPending ? "Guardando..." : plan ? "Actualizar plan" : "Guardar plan"}
            </Button>
          </div>
        </form>
      </Form>
    </NFCard>
  );
}
