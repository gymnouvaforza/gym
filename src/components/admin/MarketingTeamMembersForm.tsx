"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { saveMarketingTeamMembers } from "@/app/(admin)/dashboard/actions";
import AdminSurface from "@/components/admin/AdminSurface";
import MarketingTeamMembersSection from "@/components/admin/MarketingTeamMembersSection";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { MarketingTeamMember } from "@/lib/data/marketing-content";
import {
  marketingTeamSchema,
  type MarketingTeamValues,
} from "@/lib/validators/marketing";

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
    defaultValues: {
      teamMembers: teamMembers.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image_url: member.image_url ?? "",
        is_active: member.is_active,
        order: member.order,
      })),
    },
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
    <AdminSurface className="border border-black/8 bg-[#fbfbf8] p-5">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#111111]">Entrenadores</h3>
          <p className="mt-1 text-sm text-[#5f6368]">
            Gestiona los perfiles de los entrenadores que aparecen en la sección de expertos.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MarketingTeamMembersSection 
            form={form} 
            isPending={isPending} 
            disabledReason={disabledReason} 
          />

          <div className="flex flex-col gap-3 border-t border-black/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 flex-1">
              <p className="text-sm text-[#5f6368]" aria-live="polite">
                {isPending
                  ? "Guardando entrenadores..."
                  : feedback ?? disabledReason ?? "Edita los perfiles y guarda para publicar."}
              </p>
              {hasErrors && (
                <div className="text-xs text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Hay errores de validacion en los entrenadores.
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className="w-full sm:w-auto px-6"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar entrenadores
            </Button>
          </div>
        </form>
      </Form>
    </AdminSurface>
  );
}
