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
import { ConfigContactSection } from "@/features/admin/config/components/ConfigContactSection";

interface GymInfoFormProps {
  settings: SiteSettings;
  disabledReason?: string;
}

export default function GymInfoForm({ settings, disabledReason }: GymInfoFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toConfigFormValues(settings),
  });

  function onSubmit(values: SiteSettingsValues) {
    startTransition(async () => {
      try {
        await saveSiteSettings(values);
        toast.success("Información corporativa actualizada correctamente.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error crítico al guardar.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <input type="hidden" {...form.register("seo_og_image_url")} />
        
        <ConfigContactSection />

        <AdminSurface className="sticky bottom-6 z-10 border-black/5 bg-white/90 p-5 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7f87]" aria-live="polite">
              {disabledReason ? (
                <span className="text-[#d71920]">{disabledReason}</span>
              ) : (
                "ESTADO: EDICIÓN ACTIVA DE INFORMACIÓN"
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
                  <span>Actualizar Información</span>
                </div>
              )}
            </Button>
          </div>
        </AdminSurface>
      </form>
    </Form>
  );
}
