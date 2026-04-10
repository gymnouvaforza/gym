"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { saveSiteSettings } from "@/app/(admin)/dashboard/actions";
import AdminCollapsibleSection from "@/components/admin/AdminCollapsibleSection";
import AdminSurface from "@/components/admin/AdminSurface";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatSeoKeywordsInput } from "@/lib/seo";
import type { SiteSettings } from "@/lib/supabase/database.types";
import { formatDateTimeLocalInput, topbarVariants } from "@/lib/topbar";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validators/settings";

interface WebSectionFormProps {
  settings: SiteSettings;
  disabledReason?: string;
}

export default function WebSectionForm({ settings, disabledReason }: WebSectionFormProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      ...settings,
      topbar_variant: settings.topbar_variant as SiteSettingsValues["topbar_variant"],
      topbar_text: settings.topbar_text ?? "",
      topbar_cta_label: settings.topbar_cta_label ?? "",
      topbar_cta_url: settings.topbar_cta_url ?? "",
      topbar_expires_at: formatDateTimeLocalInput(settings.topbar_expires_at),
      contact_phone: settings.contact_phone ?? "",
      whatsapp_url: settings.whatsapp_url ?? "",
      address: settings.address ?? "",
      opening_hours: settings.opening_hours ?? "",
      hero_video_url: settings.hero_video_url ?? "",
      seo_keywords: formatSeoKeywordsInput(settings.seo_keywords),
      seo_canonical_url: settings.seo_canonical_url ?? "",
      seo_og_image_url: settings.seo_og_image_url ?? "",
    },
  });

  const topbarEnabled = useWatch({ control: form.control, name: "topbar_enabled" });

  function onSubmit(values: SiteSettingsValues) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await saveSiteSettings(values);
        setFeedback("success");
        setTimeout(() => setFeedback(null), 4000);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Error al guardar.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-20">
        <input type="hidden" {...form.register("seo_og_image_url")} />
        <AdminCollapsibleSection
          title="Mensaje de bienvenida (Hero)"
          description="Lo primero que ven los clientes al entrar."
          defaultOpen
        >
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="hero_badge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto pequeno superior</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hero_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo principal</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hero_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripcion</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="hero_primary_cta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boton principal</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hero_secondary_cta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Boton secundario</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-2 border-t border-black/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">Listado de destacados</p>
              <FormField
                control={form.control}
                name="hero_highlight_one"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destacado 1</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: +10 anos de experiencia en Chiclayo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hero_highlight_two"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destacado 2</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Equipos profesionales de alta gama" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hero_highlight_three"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destacado 3</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Entrenadores certificados" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </AdminCollapsibleSection>

        <AdminCollapsibleSection
          title="Promo activa (Topbar)"
          description="Aviso especial con fecha de fin."
          defaultOpen={topbarEnabled}
        >
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="topbar_enabled"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-none border border-black/8 bg-white p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="h-4 w-4 accent-[#d71920]"
                    />
                  </FormControl>
                  <div>
                    <p className="text-sm font-semibold">Mostrar promo</p>
                  </div>
                </FormItem>
              )}
            />
            {topbarEnabled ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="topbar_variant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estilo</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="h-10 w-full rounded-none border border-input bg-background px-3"
                          >
                            {topbarVariants.map((variant) => (
                              <option key={variant} value={variant}>
                                {variant === "promotion"
                                  ? "Oferta"
                                  : variant === "announcement"
                                    ? "Anuncio"
                                    : "Aviso"}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topbar_expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuando termina</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="topbar_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto de la promo</FormLabel>
                      <FormControl>
                        <Input placeholder="Matricula gratis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}
          </div>
        </AdminCollapsibleSection>

        <AdminSurface className="sticky bottom-4 z-10 border-black/10 bg-white/95 p-4 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {feedback === "success" ? (
                <div className="flex items-center gap-2 rounded-none bg-green-500/10 px-3 py-1 text-[11px] font-bold text-green-700 animate-in fade-in slide-in-from-left-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Cambios publicados correctamente
                </div>
              ) : (
                <p className="text-sm text-[#5f6368]" aria-live="polite">
                  {isPending
                    ? "Guardando cambios..."
                    : feedback ?? disabledReason ?? "Edita la seccion y guarda para publicar."}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isPending || Boolean(disabledReason)}
              className="w-full sm:w-auto"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar diseno
            </Button>
          </div>
        </AdminSurface>
      </form>
    </Form>
  );
}
