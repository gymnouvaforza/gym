"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

import { CartEntry } from "@/features/checkout";
import SiteHeaderAuthActions from "@/components/marketing/SiteHeaderAuthActions";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import { normalizeSiteName } from "@/lib/seo";
import type { SiteSettings } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

// Cargamos el contenido del menu movil de forma dinamica (solo cliente, cuando se necesita)
const MobileMenuContent = dynamic(() => import("@/components/marketing/MobileMenuContent"), {
  ssr: false,
});

interface SiteHeaderProps {
  settings: SiteSettings;
  activeModules: SystemModuleStateMap;
}

export default function SiteHeader({
  settings,
  activeModules,
}: Readonly<SiteHeaderProps>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const siteName = normalizeSiteName(settings.site_name);
  const navItems = novaForzaHomeContent.navItems.filter(
    (item) => item.href !== "/tienda" || activeModules.tienda,
  );

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  return (
    <>
      <header 
        data-component="site-header"
        className="relative z-[70] border-b border-border bg-background/95 backdrop-blur-md py-3 sm:py-4 lg:py-6"
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
                priority
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

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-muted/5 text-foreground cursor-pointer rounded-[var(--radius-base)] lg:hidden"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
            >
              <div className="flex flex-col gap-1.5 relative h-full w-full items-center justify-center">
                <span className={cn(
                  "h-0.5 w-5 sm:w-6 bg-foreground transition-all duration-300 ease-in-out rounded-none",
                  isMenuOpen ? "rotate-45 translate-y-2 w-6" : ""
                )} />
                <span className={cn(
                  "h-0.5 w-5 sm:w-6 bg-foreground transition-all duration-300 ease-in-out rounded-none",
                  isMenuOpen ? "opacity-0" : ""
                )} />
                <span className={cn(
                  "h-0.5 w-3 sm:w-4 bg-foreground transition-all duration-300 ease-in-out rounded-none self-end",
                  isMenuOpen ? "-rotate-45 -translate-y-2 w-6 self-center" : ""
                )} />
              </div>
            </button>
          </div>
        </div>
      </header>

      <MobileMenuContent
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        settings={settings}
        activeModules={activeModules}
        navItems={navItems}
      />
    </>
  );
}
