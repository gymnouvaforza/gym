import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

export default function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="border-b border-black/5 bg-[#f5f5f0] py-4 lg:py-6">
      <div className="section-shell flex items-center justify-between gap-8">
        <Link href="/" className="group relative flex shrink-0 items-center justify-center transition-transform hover:scale-105" aria-label={settings.site_name}>
          <div className="relative h-10 w-32 sm:h-12 sm:w-40">
            <Image
              src="/images/logo/logo-trans.webp"
              alt={settings.site_name}
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {novaForzaHomeContent.navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] font-bold uppercase tracking-[0.4em] text-foreground transition-all hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild className="btn-athletic btn-primary !h-12 !px-8 !text-xs">
            <Link href="#contacto">{settings.hero_primary_cta}</Link>
          </Button>
          <button className="flex h-12 w-12 items-center justify-center bg-black/5 text-foreground lg:hidden">
            <span className="sr-only">Menu</span>
            <div className="flex flex-col gap-1.5">
              <span className="h-0.5 w-6 rounded-full bg-foreground" />
              <span className="h-0.5 w-4 rounded-full bg-foreground" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
