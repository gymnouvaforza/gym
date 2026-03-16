import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/supabase/database.types";

const FALLBACK_IMAGE = "/images/hero/banner-1.png";
const DEFAULT_VIDEO_PATH = "/video/video.mp4";

function renderHeroTitle(_title: string, part: "left" | "right") {
  // Simulating the split from the image: "EL PODER DE TU PROGRESO" and "COMIENZA AQUÍ"
  // If the title is "EL PODER DE TU PROGRESO COMIENZA AQUÍ"
  
  if (part === "left") {
    // And "PROGRESO" as accent
    return (
      <>
        <span className="block text-white">EL PODER</span>
        <span className="block text-white">DE TU</span>
        <span className="block text-accent">PROGRESO</span>
      </>
    );
  } else {
    // Take the rest: COMIENZA AQUÍ
    return (
      <>
        <span className="block text-white">COMIENZA</span>
        <span className="block text-white">AQUÍ</span>
      </>
    );
  }
}

export default function HeroSection({ settings }: { settings: SiteSettings }) {
  const heroVideoUrl = settings.hero_video_url ?? DEFAULT_VIDEO_PATH;

  return (
    <section
      id="inicio"
      className="relative section-anchor min-h-screen overflow-hidden bg-[#090909]"
    >
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(215,25,32,0.1)_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(215,25,32,0.08)_0%,_transparent_50%)]" />

      <div className="section-shell relative z-10 flex min-h-screen flex-col justify-center py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px_1fr] lg:items-center">
          
          {/* LEFT COLUMN: Badge + Title Part 1 + Description */}
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            <div className="animate-slide-up flex items-center gap-3 reveal-1 [animation-fill-mode:forwards]">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent">
                {settings.hero_badge || "Entrenamiento Premium en Lima"}
              </p>
            </div>

            <h2 className="animate-slide-up mt-8 font-display text-[54px] font-extrabold uppercase italic leading-[0.85] tracking-tight text-white reveal-2 sm:text-[72px] lg:text-[94px] [animation-fill-mode:forwards]">
              {renderHeroTitle(settings.hero_title, "left")}
            </h2>

            <p className="animate-slide-up mt-10 max-w-sm text-[16px] leading-7 text-white/60 reveal-4 sm:text-[18px] [animation-fill-mode:forwards]">
              {settings.hero_description}
            </p>
          </div>

          {/* CENTER COLUMN: The Video Reel - Blended / Minimalist */}
          <div className="animate-slide-up relative mx-auto w-full max-w-[340px] reveal-2 lg:mx-0 [animation-fill-mode:forwards]">
            {/* Ambient Glow behind video */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-accent/15 blur-[100px]" />
            
            <div className="relative aspect-[9/16] overflow-hidden">
              {/* Fallback & Video */}
              <Image
                src={FALLBACK_IMAGE}
                alt="Nova Forza Hero"
                fill
                className="object-cover opacity-20 blur-xl"
                priority
              />
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={FALLBACK_IMAGE}
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={heroVideoUrl} type="video/mp4" />
              </video>

              {/* Edge Blending Overlays */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#090909_0%,transparent_15%,transparent_85%,#090909_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#090909_0%,transparent_10%,transparent_90%,#090909_100%)]" />
            </div>
          </div>

          {/* RIGHT COLUMN: Title Part 2 + CTAs + Quote */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="animate-slide-up font-display text-[54px] font-extrabold uppercase italic leading-[0.85] tracking-tight text-white reveal-3 sm:text-[72px] lg:text-[94px] [animation-fill-mode:forwards]">
              {renderHeroTitle(settings.hero_title, "right")}
            </h2>

            <div className="animate-slide-up mt-12 flex flex-col gap-3 reveal-4 sm:flex-row [animation-fill-mode:forwards]">
              <Button asChild className="btn-athletic bg-accent text-white !h-16 !px-8 hover:bg-white hover:text-black">
                <Link href="#planes" className="flex items-center gap-3">
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70">Ver</span>
                    <span className="text-sm font-black">PLANES</span>
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn-athletic border-white/10 bg-white/5 text-white !h-16 !px-8 hover:bg-white/10">
                <Link href="#contacto">
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-[10px] opacity-70">Reserva tu</span>
                    <span className="text-sm font-black">PRUEBA</span>
                  </span>
                </Link>
              </Button>
            </div>

            <div className="animate-fade-in mt-14 max-w-sm border-t border-white/10 pt-6 reveal-4 [animation-fill-mode:forwards]">
              <p className="text-[11px] font-bold uppercase leading-relaxed tracking-[0.15em] text-white/30">
                Fuerza con estructura, coaches presentes y un espacio pensado para meterle en serio.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Aesthetic Scroll Indicator */}
      <div className="animate-fade-in absolute bottom-12 left-1/2 -translate-x-1/2 reveal-4 [animation-fill-mode:forwards]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent relative">
            <div className="animate-scroll-dot absolute inset-x-0 top-0 mx-auto w-[2px] h-[6px] bg-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}

