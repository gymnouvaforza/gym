import Image from "next/image";
import Link from "next/link";

import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const whatsappHref = settings.whatsapp_url?.trim() ? settings.whatsapp_url : "#contacto";
  const contactEmail = settings.contact_email ?? "info@novaforza.com";

  return (
    <footer className="relative overflow-hidden bg-[#0a0a0b] py-24 text-white">
      <div className="absolute inset-0 athletic-grid opacity-5" />
      <div className="section-shell relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
          <div>
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <div className="relative h-12 w-48">
                <Image
                  src="/images/logo/logo-trans.webp"
                  alt={settings.site_name}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="mt-8 max-w-xs text-lg leading-relaxed text-zinc-500">
              Nova Forza es resistencia fisica y mental en Madrid. Un espacio para rendir mejor
              sin ruido.
            </p>
            <div className="mt-10 flex gap-4">
              {novaForzaHomeContent.socials.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex h-12 w-12 items-center justify-center bg-white/5 transition-all hover:bg-accent hover:text-white"
                  aria-label={item.label}
                >
                  <span className="sr-only">{item.label}</span>
                  <div className="font-display text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {item.label.slice(0, 2)}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl font-bold uppercase tracking-widest text-white">
              Navegacion
            </h4>
            <ul className="mt-8 space-y-4">
              {novaForzaHomeContent.footerQuickLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="#contacto"
                    className="text-sm font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-accent"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-xl font-bold uppercase tracking-widest text-white">
              Horarios
            </h4>
            <div className="mt-8 space-y-4">
              {novaForzaHomeContent.footerHours.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[1fr_auto] gap-4 text-sm font-bold uppercase tracking-wider"
                >
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-accent">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl font-bold uppercase tracking-widest text-white">
              Contacto rapido
            </h4>
            <p className="mt-8 text-sm leading-relaxed text-zinc-500">
              Agenda una prueba o resuelve dudas en minutos por WhatsApp o email.
            </p>
            <div className="mt-8 grid gap-3">
              <Link
                href={whatsappHref}
                className="flex h-14 items-center justify-center bg-accent px-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-accent/90"
              >
                Escribir por WhatsApp
              </Link>
              <Link
                href={`mailto:${contactEmail}`}
                className="flex h-14 items-center justify-center border border-white/15 px-4 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white/35"
              >
                Enviar email
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-white/5 pt-10 text-center lg:flex lg:items-center lg:justify-between lg:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            &copy; {new Date().getFullYear()} Nova Forza Gym. Todos los derechos reservados.
          </p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 lg:mt-0">
            Disenado para rendimiento real.
          </p>
        </div>
      </div>
    </footer>
  );
}
