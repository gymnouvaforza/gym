import Image from "next/image";
import Link from "next/link";

import { CartEntry } from "@/features/checkout";
import SiteHeaderAuthActions from "@/components/marketing/SiteHeaderAuthActions";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import { normalizeSiteName } from "@/lib/seo";
import type { SiteSettings } from "@/lib/supabase/database.types";

interface SiteHeaderProps {
  settings: SiteSettings;
  activeModules: SystemModuleStateMap;
}

export default function SiteHeader({
  settings,
  activeModules,
}: Readonly<SiteHeaderProps>) {
  const siteName = normalizeSiteName(settings.site_name);
  const navItems = novaForzaHomeContent.navItems.filter(
    (item) => item.href !== "/tienda" || activeModules.tienda,
  );

  return (
    <header 
      data-component="site-header"
      className="border-b border-border bg-background py-3 sm:py-4 lg:py-7"
    >
      <div className="section-shell flex items-center justify-between gap-2 sm:gap-8">
        <Link
          href="/"
          className="group relative flex shrink-0 items-center justify-center transition-transform hover:scale-105"
          aria-label={siteName}
        >
          <div className="relative h-7 w-20 xs:h-8 xs:w-24 sm:h-12 sm:w-40">
            <Image
              src="/images/logo/logo-trans.webp"
              alt={siteName}
              fill
              className="object-contain"
              sizes="(min-width: 640px) 160px, 105px"
              quality={52}
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {navItems.map((item) => (
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
          {activeModules.tienda ? <CartEntry /> : null}
          <SiteHeaderAuthActions
            primaryLabel={settings.hero_primary_cta}
            mode="desktop"
          />

          <details className="relative lg:hidden">
            <summary className="flex h-9 w-9 sm:h-12 sm:w-12 list-none items-center justify-center bg-muted/5 text-foreground [&::-webkit-details-marker]:hidden cursor-pointer rounded-[var(--radius-base)]">
              <span className="sr-only">Abrir menu</span>
              <div className="flex flex-col gap-1.5">
                <span className="h-0.5 w-4 sm:w-6 rounded-none bg-foreground" />
                <span className="h-0.5 w-2.5 sm:w-4 rounded-none bg-foreground" />
              </div>
            </summary>
            <div className="fixed right-4 sm:absolute sm:right-0 top-16 sm:top-14 z-[100] w-[min(20rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-top-2 border border-border bg-background p-4 shadow-xl duration-200 rounded-[var(--radius-base)]">
              <nav className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="border-b border-border px-2 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground last:border-b-0"
                  >
                    {item.label}
                  </Link>
                ))}
                <SiteHeaderAuthActions
                  primaryLabel={settings.hero_primary_cta}
                  mode="mobile"
                />
                {activeModules.tienda ? (
                  <div className="mt-2 border-t border-border pt-4">
                    <Link
                      href="/carrito"
                      className="block border border-border px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-foreground transition hover:border-primary/35 hover:bg-primary/5 rounded-[var(--radius-base)]"
                    >
                      Ver carrito
                    </Link>
                  </div>
                ) : null}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
