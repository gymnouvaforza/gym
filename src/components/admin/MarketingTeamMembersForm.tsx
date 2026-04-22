"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { saveMarketingTeamMembers } from "@/app/(admin)/dashboard/actions";
import AdminSurface from "@/components/admin/AdminSurface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { MarketingTeamMember } from "@/lib/data/marketing-content";
import {
  marketingTeamSchema,
  type MarketingTeamValues,
} from "@/lib/validators/marketing";

// Domain Specific Imports
import { toMarketingTeamFormValues } from "@/features/admin/marketing/services/marketing-mappers";
import { MarketingTeamSection } from "@/features/admin/marketing/components/MarketingTeamSection";

interface MarketingTeamMembersFormProps {
  teamMembers: MarketingTeamMember[];
  disabledReason?: string;
}

export default function MarketingTeamMembersForm({
  teamMembers,
  disabledReason,
}: Readonly<MarketingTeamMembersFormProps>) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<MarketingTeamValues>({
    resolver: zodResolver(marketingTeamSchema),
    defaultValues: toMarketingTeamFormValues(teamMembers),
  });

  const hasErrors = !!form.formState.errors.teamMembers;

  function onSubmit(values: MarketingTeamValues) {
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await saveMarketingTeamMembers(values.teamMembers);
        
        if (result.success) {
          form.reset(values);
          setFeedback("Entrenadores actualizados correctamente.");
        } else {
          setFeedback(result.error || "Error al guardar los entrenadores.");
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Error fatal al guardar.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <MarketingTeamSection 
          isPending={isPending} 
          disabledReason={disabledReason} 
        />

        <AdminSurface className="sticky bottom-4 z-10 border-black/10 bg-white/95 p-6 backdrop-blur shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm font-black uppercase tracking-tight text-[#111111]" aria-live="polite">
                {isPending
                  ? "Guardando cambios..."
                  : feedback ?? disabledReason ?? "Edita los perfiles y guarda para publicar."}
              </p>
              {hasErrors && (
                <div className="text-[10px] text-[#d71920] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Hay errores de validación en los entrenadores.
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className="h-14 px-10 bg-[#111111] text-white font-black uppercase tracking-[0.2em] hover:bg-[#d71920] transition-all rounded-none"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar Equipo
            </Button>
          </div>
        </AdminSurface>
      </form>
    </Form>
  );
}
