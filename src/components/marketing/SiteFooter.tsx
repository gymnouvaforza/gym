import Image from "next/image";
import Link from "next/link";


import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="relative overflow-hidden bg-[#0a0a0b] py-24 text-white">
      <div className="absolute inset-0 athletic-grid opacity-5" />
      <div className="section-shell relative z-10">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
          {/* Brand Col */}
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
              Nova Forza es la resistencia física y mental en Madrid. Un espacio diseñado para alcanzar el máximo rendimiento sin distracciones.
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

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xl font-bold uppercase tracking-widest text-white">Navegación</h4>
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

          {/* Opening Hours */}
          <div>
            <h4 className="font-display text-xl font-bold uppercase tracking-widest text-white">Horarios</h4>
            <div className="mt-8 space-y-4">
              {novaForzaHomeContent.footerHours.map((item) => (
                <div key={item.label} className="grid grid-cols-[1fr_auto] gap-4 text-sm font-bold uppercase tracking-wider">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-accent">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="font-display text-xl font-bold uppercase tracking-widest text-white">Newsletter</h4>
            <p className="mt-8 text-sm leading-relaxed text-zinc-500">
              Recibe consejos semanales sobre entrenamiento y nutrición elite.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full bg-white/5 border-none p-5 text-sm focus:ring-2 focus:ring-accent transition-all"
              />
              <button
                type="button"
                className="flex h-16 w-full items-center justify-center bg-accent text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent/90"
              >
                Suscribirme
              </button>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-white/5 pt-10 text-center lg:flex lg:items-center lg:justify-between lg:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
            &copy; {new Date().getFullYear()} Nova Forza Gym. Todos los derechos reservados.
          </p>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 lg:mt-0">
            Diseñado para el Máximo Rendimiento.
          </p>
        </div>
      </div>
    </footer>
  );
}
