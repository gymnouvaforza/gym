"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, RotateCcw, Calendar, MessageCircle, Target, FileText } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveLeadFollowUp } from "@/app/(admin)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTimeLocalInput } from "@/lib/topbar";
import type { Lead } from "@/lib/supabase/database.types";
import { leadFollowUpSchema, type LeadFollowUpValues } from "@/lib/validators/lead";
import { NFCard } from "@/components/system/nf-card";
import { NFField } from "@/components/system/nf-field";
import { cn } from "@/lib/utils";

interface LeadFollowUpFormProps {
  lead: Pick<Lead, "id" | "contacted_at" | "channel" | "outcome" | "next_step">;
  disabledReason?: string;
}

function getDefaultValues(lead: LeadFollowUpFormProps["lead"]): LeadFollowUpValues {
  return {
    contacted_at: formatDateTimeLocalInput(lead.contacted_at),
    channel: lead.channel ?? "",
    outcome: lead.outcome ?? "",
    next_step: lead.next_step ?? "",
  };
}

export default function LeadFollowUpForm({ lead, disabledReason }: LeadFollowUpFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LeadFollowUpValues>({
    resolver: zodResolver(leadFollowUpSchema),
    defaultValues: getDefaultValues(lead),
  });

  useEffect(() => {
    form.reset(getDefaultValues(lead));
  }, [form, lead]);

  function onSubmit(values: LeadFollowUpValues) {
    startTransition(async () => {
      try {
        await saveLeadFollowUp(lead.id, values);
        form.reset(values);
        toast.success("Seguimiento actualizado correctamente.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al guardar el seguimiento.");
      }
    });
  }

  return (
    <NFCard 
      title="Bitácora Comercial" 
      description="Historial del último contacto y estrategia de cierre."
      className="shadow-xl shadow-black/[0.02] border-black/5"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 grid-cols-1">
            <NFField
              name="contacted_at"
              label="Último Contacto"
              type="datetime-local"
              icon={Calendar}
              tooltip="Fecha y hora exactas del último intento de comunicación."
              disabled={Boolean(disabledReason) || isPending}
            />
            <NFField
              name="channel"
              label="Canal de Contacto"
              placeholder="Ej: WhatsApp, Llamada, Instagram..."
              icon={MessageCircle}
              tooltip="Vía por la cual se entabló o intentó la comunicación."
              disabled={Boolean(disabledReason) || isPending}
            />
          </div>

          <NFField
            name="outcome"
            label="Resultado"
            placeholder="Ej: Pidió precios, visita agendada, sin respuesta..."
            icon={Target}
            tooltip="Conclusión resumida del intercambio con el prospecto."
            disabled={Boolean(disabledReason) || isPending}
          />

          <div className="pt-2">
            <FormField
              control={form.control}
              name="next_step"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2 group/label">
                    <FileText className="size-3.5 text-muted-foreground/60 transition-colors group-focus-within/label:text-[#d71920]" />
                    <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87] group-focus-within/label:text-[#111111] transition-colors">
                      Siguiente Paso (Estrategia)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Ejemplo: volver a escribir el jueves con opciones del plan Progreso..."
                      disabled={Boolean(disabledReason) || isPending}
                      className="min-h-[120px] bg-black/[0.02] border-black/5 rounded-2xl px-5 py-4 font-medium text-[#111111] focus:ring-0 focus:border-[#111111] focus:bg-white transition-all duration-300 placeholder:text-muted-foreground/20 leading-relaxed shadow-inner resize-none"
                    />
                  </FormControl>
                  <p className="text-[10px] font-medium italic opacity-70 text-[#5f6368]">
                    Registra solo lo esencial para tu próxima acción comercial.
                  </p>
                  <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-black/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]" aria-live="polite">
              {disabledReason ? (
                <span className="text-[#d71920]">{disabledReason}</span>
              ) : (
                "ACTUALIZA EL ESTADO AL INSTANTE"
              )}
            </p>
            <Button 
              type="submit" 
              disabled={isPending || Boolean(disabledReason)}
              className={cn(
                "h-12 px-8 text-white font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-xl shadow-lg",
                isPending ? "bg-white/10 text-muted-foreground" : "bg-[#111111] hover:bg-[#d71920] hover:shadow-red-500/20"
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 animate-spin text-muted-foreground" />
                  <span>Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="size-4" />
                  <span>Guardar Seguimiento</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </NFCard>
  );
}
