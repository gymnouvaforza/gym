import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import { normalizeSeoCopy, normalizeSiteName } from "@/lib/seo";
import type { SiteSettings } from "@/lib/supabase/database.types";

export default function SiteFooter({
  settings,
  legalLinks = [],
}: {
  settings: SiteSettings;
  legalLinks?: Array<{
    key: string;
    href: string;
    label: string;
  }>;
}) {
  const siteName = normalizeSiteName(settings.site_name);
  const whatsappHref = settings.whatsapp_url?.trim() ? settings.whatsapp_url : "#contacto";
  const contactEmail = settings.contact_email ?? "soporte@nuovaforzagym.com";
  const contactAddress =
    normalizeSeoCopy(settings.address) || novaForzaHomeContent.contact.address;
  const contactPhone =
    settings.contact_phone?.trim() || novaForzaHomeContent.contact.whatsappDisplay;
  const footerCopy =
    normalizeSeoCopy(settings.footer_text) ||
    "Nuova Forza es un gimnasio local orientado a fuerza, progreso real y una experiencia seria y cercana.";

  return (
    <footer className="relative overflow-hidden bg-[#070708] pb-12 pt-32 text-white">
      <div className="pointer-events-none absolute -bottom-12 left-0 w-full select-none overflow-hidden leading-none">
        <span className="athletic-outline block text-[22vw] font-black uppercase tracking-tighter opacity-10">
          {siteName}
        </span>
      </div>

      <div className="section-shell relative z-10">
        <div className="mb-24 grid gap-12 border-b border-white/5 pb-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="font-display text-4xl font-extrabold uppercase italic leading-tight text-white sm:text-5xl lg:text-6xl">
              Unete al{" "}
              <span className="text-accent underline decoration-white/10 underline-offset-8">
                Club
              </span>
            </h3>
            <p className="mt-6 max-w-md text-lg text-zinc-400">
              Recibe consejos de entrenamiento, preventas exclusivas y novedades de la comunidad{" "}
              {siteName}.
            </p>
          </div>
          <div className="relative">
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="TU EMAIL"
                className="h-16 flex-1 bg-white/5 px-6 text-sm font-bold uppercase tracking-widest text-white outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-accent"
                required
              />
              <Button
                type="submit"
                className="btn-athletic bg-accent !h-16 px-8 hover:bg-white hover:text-black"
              >
                SUSCRIBIRME
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              Al suscribirte, aceptas nuestra politica de privacidad.
            </p>
          </div>
        </div>

        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1.5fr_1fr]">
          <div className="flex flex-col">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <div className="relative h-12 w-48">
                <Image
                  src="/images/logo/logo-trans.webp"
                  alt={siteName}
                  fill
                  className="object-contain"
                  sizes="192px"
                />
              </div>
            </Link>
            <p className="mt-8 max-w-xs text-sm leading-relaxed text-zinc-500">{footerCopy}</p>
            <div className="mt-10 flex gap-4">
              {novaForzaHomeContent.socials.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex h-12 w-12 items-center justify-center border border-white/10 transition-all hover:border-accent hover:bg-accent"
                  aria-label={item.label}
                >
                  <span className="sr-only">{item.label}</span>
                  <div className="font-display text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-white">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold uppercase italic tracking-widest text-white">
              Explorar
            </h4>
            <ul className="mt-8 space-y-4">
              {novaForzaHomeContent.navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
                  >
                    <span className="mr-2 h-px w-0 bg-accent transition-all group-hover:w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold uppercase italic tracking-widest text-white">
              Sede principal
            </h4>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 shrink-0 text-accent" />
                <p className="text-xs font-bold uppercase leading-relaxed tracking-widest text-zinc-400">
                  {contactAddress}
                </p>
              </div>
              <div className="flex gap-4">
                <Phone className="h-5 w-5 shrink-0 text-accent" />
                <Link
                  href={whatsappHref}
                  className="text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
                >
                  {contactPhone}
                </Link>
              </div>
              <div className="flex gap-4">
                <Mail className="h-5 w-5 shrink-0 text-accent" />
                <Link
                  href={`mailto:${contactEmail}`}
                  className="text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
                >
                  {contactEmail}
                </Link>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold uppercase italic tracking-widest text-white">
              Soporte
            </h4>
            <ul className="mt-8 space-y-4">
              {legalLinks.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {novaForzaHomeContent.footerQuickLinks
                .filter((item) => !legalLinks.some((legalLink) => legalLink.label === item))
                .map((item) => (
                  <li key={item}>
                    <Link
                      href="#contacto"
                      className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-32 flex flex-col gap-8 border-t border-white/5 pt-10 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-700">
            &copy; {new Date().getFullYear()} {siteName} GYM. PRECISION Y PODER.
          </p>

          <div className="flex flex-wrap justify-center gap-8 lg:justify-start">
            <div className="flex items-center gap-4 border-r border-white/5 pr-8">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                PAGOS:
              </span>
              <span className="text-[10px] font-extrabold italic tracking-wider text-white opacity-40">
                PayPal
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-800">
              DISENO PARA RENDIMIENTO
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-800 tracking-tighter sm:tracking-[0.4em]">
              CHICLAYO - PERU
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
