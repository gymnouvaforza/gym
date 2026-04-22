"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveSiteSettings } from "@/app/(admin)/dashboard/actions";
import AdminSurface from "@/components/admin/AdminSurface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { SiteSettings } from "@/lib/supabase/database.types";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validators/settings";
import { cn } from "@/lib/utils";

// Domain Specific Imports
import { toConfigFormValues } from "@/features/admin/config/services/config-mappers";
import { ConfigSiteIdentitySection } from "@/features/admin/config/components/ConfigSiteIdentitySection";
import { ConfigSeoSection } from "@/features/admin/config/components/ConfigSeoSection";

interface SettingsFormProps {
  settings: SiteSettings;
  disabledReason?: string;
}

export default function SettingsForm({ settings, disabledReason }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toConfigFormValues(settings),
  });

  function onSubmit(values: SiteSettingsValues) {
    startTransition(async () => {
      try {
        await saveSiteSettings(values);
        toast.success("Ajustes avanzados actualizados correctamente.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error crítico al guardar los ajustes.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <input type="hidden" {...form.register("seo_og_image_url")} />
        
        <AdminSurface className="bg-[#fbfbf8] p-6 border-l-4 border-l-[#d71920] border-t-0 border-r-0 border-b-0 rounded-none shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d71920]">Ajustes Avanzados</p>
          <p className="mt-1.5 text-[11px] font-bold text-[#5f6368] uppercase tracking-wide">
            Configuración técnica y parámetros de indexación global.
          </p>
        </AdminSurface>

        <ConfigSiteIdentitySection isCollapsible defaultOpen={true} />
        <ConfigSeoSection isCollapsible defaultOpen={false} />

        <AdminSurface className="sticky bottom-6 z-10 border-black/5 bg-white/90 p-5 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]" aria-live="polite">
              {disabledReason ? (
                <span className="text-[#d71920]">{disabledReason}</span>
              ) : (
                "ESTADO: MODIFICANDO CONFIGURACIÓN TÉCNICA"
              )}
            </p>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className={cn(
                "h-12 px-8 text-white font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-xl shadow-lg",
                isPending ? "bg-black/40 text-white/50" : "bg-[#111111] hover:bg-[#d71920] hover:shadow-red-500/20"
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
                  <span>Guardar Ajustes</span>
                </div>
              )}
            </Button>
          </div>
        </AdminSurface>
      </form>
    </Form>
  );
}
