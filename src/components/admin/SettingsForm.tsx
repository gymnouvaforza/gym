"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { saveSiteSettings } from "@/app/(admin)/dashboard/actions";
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
import {
  formatDateTimeLocalInput,
  resolveTopbarVariant,
  toIsoDateTimeOrNull,
  topbarVariants,
} from "@/lib/topbar";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validators/settings";

interface SettingsFormProps {
  settings: SiteSettings;
  disabledReason?: string;
}

export default function SettingsForm({ settings, disabledReason }: SettingsFormProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      site_name: settings.site_name,
      site_tagline: settings.site_tagline,
      hero_badge: settings.hero_badge,
      hero_title: settings.hero_title,
      hero_description: settings.hero_description,
      hero_primary_cta: settings.hero_primary_cta,
      hero_secondary_cta: settings.hero_secondary_cta,
      hero_video_url: settings.hero_video_url ?? "",
      topbar_enabled: settings.topbar_enabled,
      topbar_variant: resolveTopbarVariant(settings.topbar_variant),
      topbar_text: settings.topbar_text ?? "",
      topbar_cta_label: settings.topbar_cta_label ?? "",
      topbar_cta_url: settings.topbar_cta_url ?? "",
      topbar_expires_at: formatDateTimeLocalInput(settings.topbar_expires_at),
      hero_highlight_one: settings.hero_highlight_one,
      hero_highlight_two: settings.hero_highlight_two,
      hero_highlight_three: settings.hero_highlight_three,
      contact_email: settings.contact_email,
      contact_phone: settings.contact_phone ?? "",
      whatsapp_url: settings.whatsapp_url ?? "",
      address: settings.address ?? "",
      opening_hours: settings.opening_hours ?? "",
      seo_title: settings.seo_title,
      seo_description: settings.seo_description,
      seo_keywords: formatSeoKeywordsInput(settings.seo_keywords),
      seo_canonical_url: settings.seo_canonical_url ?? "",
      footer_text: settings.footer_text,
    },
  });

  function onSubmit(values: SiteSettingsValues) {
    setFeedback(null);
    const payload: SiteSettingsValues = {
      ...values,
      topbar_expires_at: toIsoDateTimeOrNull(values.topbar_expires_at) ?? "",
      seo_og_image_url: settings.seo_og_image_url ?? "",
    };

    startTransition(async () => {
      try {
        await saveSiteSettings(payload);
        setFeedback("Ajustes guardados.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "No se pudieron guardar los cambios.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-3xl border border-[#d71920]/20 bg-[#d71920]/8 p-5">
          <p className="text-sm font-semibold text-white">Backoffice minimo y util</p>
          <p className="mt-2 text-sm leading-7 text-zinc-300">
            Esta pantalla controla la identidad global y el contenido editable que hoy alimenta la home comercial.
            El resto de bloques de la landing se revisan desde la pestana <span className="font-semibold text-white">Contenido</span>.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="site_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del sitio</FormLabel>
                <FormControl>
                  <Input maxLength={80} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="site_tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripcion corta</FormLabel>
                <FormControl>
                  <Input maxLength={140} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-white">Hero principal</p>
            <p className="mt-1 text-sm text-zinc-400">
              Textos base del hero y CTA principal de la home publica.
            </p>
          </div>

          <FormField
            control={form.control}
            name="hero_badge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge superior</FormLabel>
                <FormControl>
                  <Input maxLength={60} {...field} />
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
                  <Textarea rows={3} maxLength={140} {...field} />
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
                <FormLabel>Descripcion principal</FormLabel>
                <FormControl>
                  <Textarea rows={5} maxLength={320} {...field} />
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
                  <FormLabel>CTA principal</FormLabel>
                  <FormControl>
                    <Input maxLength={40} {...field} />
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
                  <FormLabel>CTA secundario</FormLabel>
                  <FormControl>
                    <Input maxLength={40} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hero_video_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video del hero</FormLabel>
                <FormControl>
                  <Input maxLength={200} placeholder="/video/video.mp4 o https://..." {...field} />
                </FormControl>
                <p className="text-xs text-zinc-500">
                  Ruta local o URL completa. El hero lo reproduce en mute, loop y sin controles.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-white">Topbar promocional</p>
            <p className="mt-1 text-sm text-zinc-400">
              Aviso superior para promos puntuales, anuncios o campanas con fecha limite.
            </p>
          </div>

          <FormField
            control={form.control}
            name="topbar_enabled"
            render={({ field }) => (
              <FormItem className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#d71920]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Activar topbar</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Se muestra sobre el header mientras la promo siga vigente.
                    </p>
                  </div>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="topbar_variant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className="flex h-12 w-full rounded-none border border-white/10 bg-black px-4 text-sm text-white outline-none transition focus:border-[#d71920]"
                    >
                      {topbarVariants.map((variant) => (
                        <option key={variant} value={variant}>
                          {variant === "promotion"
                            ? "Promo"
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
                  <FormLabel>Fecha limite</FormLabel>
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
                <FormLabel>Mensaje</FormLabel>
                <FormControl>
                  <Textarea rows={3} maxLength={180} placeholder="Matricula gratis hasta fin de mes para nuevos socios." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="topbar_cta_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CTA del topbar</FormLabel>
                  <FormControl>
                    <Input maxLength={40} placeholder="Reserva tu prueba" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="topbar_cta_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enlace del CTA</FormLabel>
                  <FormControl>
                    <Input maxLength={200} placeholder="#contacto o https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-white">Puntos clave</p>
            <p className="mt-1 text-sm text-zinc-400">
              Tres mensajes cortos que aparecen justo debajo del hero.
            </p>
          </div>

          {(["hero_highlight_one", "hero_highlight_two", "hero_highlight_three"] as const).map(
            (fieldName, index) => (
              <FormField
                key={fieldName}
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highlight {index + 1}</FormLabel>
                    <FormControl>
                      <Input maxLength={120} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ),
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-white">Contacto</p>
            <p className="mt-1 text-sm text-zinc-400">
              Datos visibles en la web y reutilizables para conversion y atencion.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" maxLength={120} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefono</FormLabel>
                  <FormControl>
                    <Input maxLength={40} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="whatsapp_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de WhatsApp</FormLabel>
                  <FormControl>
                    <Input type="url" maxLength={200} placeholder="https://wa.me/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direccion</FormLabel>
                  <FormControl>
                    <Input maxLength={180} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="opening_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horario</FormLabel>
                <FormControl>
                  <Textarea rows={3} maxLength={180} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-white/8 bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-white">SEO base</p>
            <p className="mt-1 text-sm text-zinc-400">
              Metadata principal para buscadores, Open Graph y compartidos.
            </p>
          </div>

          <FormField
            control={form.control}
            name="seo_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO title</FormLabel>
                <FormControl>
                  <Input maxLength={70} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seo_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta description</FormLabel>
                <FormControl>
                  <Textarea rows={4} maxLength={180} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="seo_keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input maxLength={240} placeholder="gimnasio local, next.js, supabase" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="seo_canonical_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canonical URL</FormLabel>
                  <FormControl>
                    <Input type="url" maxLength={200} placeholder="https://novaforza.pe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-400">
              La OG image se mantiene con fallback automatico. No hace falta tocarla para el flujo actual.
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="footer_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto del footer</FormLabel>
              <FormControl>
                <Textarea rows={4} maxLength={240} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isPending || Boolean(disabledReason)} title={disabledReason}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar ajustes
          </Button>
          {feedback || disabledReason ? (
            <p className="text-sm text-zinc-400">{feedback ?? disabledReason}</p>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
