import { ArrowRight } from "lucide-react";
import Link from "next/link";

import HeroPhoneMedia from "@/components/marketing/HeroPhoneMedia";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/supabase/database.types";

const FALLBACK_IMAGE = "/images/hero/banner-1.webp";
const DEFAULT_VIDEO_PATH = "/video/video.mp4";
const DEFAULT_HERO_TITLE = "EL PODER DE TU PROGRESO COMIENZA AQUI";

function splitHeroTitle(title: string | null) {
  const words = (title?.trim() || DEFAULT_HERO_TITLE).split(/\s+/);
  const splitIndex = Math.max(1, Math.ceil(words.length / 2));

  return {
    left: words.slice(0, splitIndex),
    right: words.slice(splitIndex),
  };
}

interface HeroSectionProps {
  settings: SiteSettings;
}

export default function HeroSection({ settings }: Readonly<HeroSectionProps>) {
  const heroVideoUrl = settings.hero_video_url ?? DEFAULT_VIDEO_PATH;
  const titleParts = splitHeroTitle(settings.hero_title);

  return (
    <section 
      id="hero-section" 
      data-component="hero-section"
      className="relative section-anchor min-h-screen overflow-hidden bg-secondary flex items-center"
      aria-labelledby="hero-title"
    >
      {/* Overlays with semantic variable naming */}
      <div className="radial-overlay-1 pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--brand-primary)_0.1,_transparent_50%)] opacity-10" />
      <div className="radial-overlay-2 pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--brand-primary)_0.08,_transparent_50%)] opacity-10" />

      <div className="section-shell relative z-10 w-full py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-[var(--radius-base)] bg-primary" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
                {settings.hero_badge || "Entrenamiento premium en Chiclayo"}
              </p>
            </div>

            <h1
              id="hero-title"
              className="mt-6 font-display text-4xl xs:text-[42px] sm:text-7xl lg:text-8xl font-black uppercase italic leading-[0.85] xs:leading-[0.8] tracking-tighter text-white sm:mt-8"
            >
              <span className="block">{titleParts.left.join(" ")}</span>
              <span className="block text-primary">{titleParts.right.join(" ")}</span>
            </h1>
            <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-white/60 sm:mt-10 sm:text-[18px]">
              {settings.hero_description}
            </p>

            <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:w-auto lg:mt-12">
              <Button
                asChild
                className="btn-athletic bg-primary text-white h-16 w-full px-10 hover:bg-white hover:text-secondary rounded-[var(--radius-base)] sm:w-auto"
              >
                <Link href="#membership-plans" className="flex items-center justify-center gap-3" aria-label="Ver planes de membresia">
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70">Ver</span>
                    <span className="text-sm font-black">PLANES</span>
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="btn-athletic border-white/20 bg-white/5 text-white h-16 w-full px-10 hover:bg-white/10 rounded-[var(--radius-base)] sm:w-auto"
              >
                <Link href="#contact-section" className="flex items-center justify-center" aria-label="Reserva tu prueba gratis">
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70">Reserva tu</span>
                    <span className="text-sm font-black">PRUEBA</span>
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden sm:block lg:col-span-5">
            <div className="animate-slide-up relative mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] reveal-2 [animation-fill-mode:forwards]">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-primary/20 blur-[120px]" />

              <div className="relative aspect-[9/16] overflow-hidden rounded-[2.5rem] border-[6px] border-white/5 shadow-2xl shadow-primary/20">
                <HeroPhoneMedia
                  imageAlt={`${settings.site_name} Hero Presentation`}
                  imageSrc={FALLBACK_IMAGE}
                  videoSrc={heroVideoUrl}
                />
              </div>
            </div>

            <div className="animate-fade-in mt-14 hidden border-t border-white/10 pt-8 reveal-4 lg:block [animation-fill-mode:forwards]">
              <p className="max-w-xs text-[11px] font-bold uppercase leading-relaxed tracking-[0.2em] text-white/30">
                Fuerza con estructura, coaches presentes y un espacio pensado para meterle en serio.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in absolute bottom-8 left-1/2 -translate-x-1/2 reveal-4 [animation-fill-mode:forwards] sm:bottom-12">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-10 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent sm:h-12">
            <div className="animate-scroll-dot absolute inset-x-0 top-0 mx-auto h-[6px] w-[2px] bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
