import Image from "next/image";
import Link from "next/link";

import CartEntry from "@/components/cart/CartEntry";
import SiteHeaderAuthActions from "@/components/marketing/SiteHeaderAuthActions";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

interface SiteHeaderProps {
  settings: SiteSettings;
}

export default function SiteHeader({ settings }: Readonly<SiteHeaderProps>) {
  return (
    <header className="border-b border-black/5 bg-[#f5f5f0] py-3 sm:py-4 lg:py-7">
      <div className="section-shell flex items-center justify-between gap-2 sm:gap-8">
        <Link
          href="/"
          className="group relative flex shrink-0 items-center justify-center transition-transform hover:scale-105"
          aria-label={settings.site_name}
        >
          <div className="relative h-7 w-20 xs:h-8 xs:w-24 sm:h-12 sm:w-40">
            <Image
              src="/images/logo/logo-trans.webp"
              alt={settings.site_name}
              fill
              className="object-contain"
              sizes="160px"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {novaForzaHomeContent.navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground transition-all hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3 lg:gap-6">
          <CartEntry />
          <SiteHeaderAuthActions primaryLabel={settings.hero_primary_cta} mode="desktop" />

          <details className="relative lg:hidden">
            <summary className="flex h-9 w-9 sm:h-12 sm:w-12 list-none items-center justify-center bg-black/5 text-foreground [&::-webkit-details-marker]:hidden cursor-pointer">
              <span className="sr-only">Abrir menu</span>
              <div className="flex flex-col gap-1.5">
                <span className="h-0.5 w-4 sm:w-6 rounded-none bg-foreground" />
                <span className="h-0.5 w-2.5 sm:w-4 rounded-none bg-foreground" />
              </div>
            </summary>
            <div className="fixed right-4 sm:absolute sm:right-0 top-16 sm:top-14 z-[100] w-[min(20rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-2 border border-black/8 bg-[#f5f5f0] p-4 shadow-xl duration-200">
              <nav className="flex flex-col">
                {novaForzaHomeContent.navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="border-b border-black/6 px-2 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground last:border-b-0"
                  >
                    {item.label}
                  </Link>
                ))}
                <SiteHeaderAuthActions primaryLabel={settings.hero_primary_cta} mode="mobile" />
                <div className="mt-2 border-t border-black/8 pt-4">
                  <Link
                    href="/carrito"
                    className="block border border-black/12 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#111111] transition hover:border-[#d71920]/35 hover:bg-[#fff7f7]"
                  >
                    Ver carrito
                  </Link>
                </div>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
