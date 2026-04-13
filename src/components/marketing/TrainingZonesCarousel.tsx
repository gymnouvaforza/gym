"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { Bike, Dumbbell, Flame, HeartPulse, ChevronLeft, ChevronRight, Users } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { Button } from "@/components/ui/button";
import {
  getOrderedTrainingZones,
  trainingZonesSectionCopy,
  type TrainingZone,
  type TrainingZoneIcon,
} from "@/data/training-zones";

const zoneIconMap: Record<TrainingZoneIcon, typeof Dumbbell> = {
  dumbbell: Dumbbell,
  flame: Flame,
  "heart-pulse": HeartPulse,
  users: Users,
  bike: Bike,
};

function ZoneCard({
  zone,
  shouldLoadVideo,
}: {
  zone: TrainingZone;
  shouldLoadVideo: boolean;
}) {
  const Icon = zoneIconMap[zone.icon];
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="group relative flex h-[500px] w-[300px] shrink-0 flex-col overflow-hidden bg-black sm:h-[600px] sm:w-[340px] md:h-[640px] md:w-[360px]">
      <div className="absolute inset-0 z-0">
        {zone.poster ? (
          <Image
            src={zone.poster}
            alt={zone.title}
            fill
            className="object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 340px, 300px"
            quality={60}
          />
        ) : (
          <div className="flex h-full flex-col justify-end bg-[radial-gradient(circle_at_top,_rgba(215,25,32,0.24),_transparent_34%),linear-gradient(180deg,_#0e0e10_0%,_#18181b_100%)] p-8 text-white">
            <div className="mb-auto flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.05]">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">
              Clip no disponible
            </p>
          </div>
        )}

        {shouldLoadVideo && !videoFailed ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={zone.poster}
            className="h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            onError={() => setVideoFailed(true)}
          >
            <source src={zone.video} type="video/mp4" />
          </video>
        ) : null}
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-500" />

      <div className="relative z-20 flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center border border-white/10 bg-black/40 text-accent backdrop-blur-md transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <span className="border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
            {zone.short_label}
          </span>
        </div>

        <div className="mt-auto flex flex-col justify-end">
          <h3 className="flex flex-col gap-2 font-display text-3xl font-black uppercase italic leading-[0.9] text-white sm:text-4xl md:text-5xl">
            {zone.title.split(" ").map((word, index) => (
              <span key={`${zone.id}-${index}`} className="block">
                {word}
              </span>
            ))}
          </h3>

          {zone.subtitle ? (
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              {zone.subtitle}
            </p>
          ) : null}

          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/70">
            {zone.description}
          </p>

          {zone.cta_label && zone.cta_href ? (
            <div className="mt-6">
              <Button
                asChild
                className="btn-athletic btn-primary w-full !h-12 !text-[11px] opacity-100 sm:translate-y-4 sm:opacity-0 sm:transition-all sm:duration-300 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
              >
                <Link href={zone.cta_href}>{zone.cta_label}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function TrainingZonesCarousel() {
  const zones = useMemo(() => getOrderedTrainingZones(), []);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!sectionRef.current || hasEnteredViewport) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEnteredViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasEnteredViewport]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const syncSelectedIndex = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
    };

    syncSelectedIndex();
    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", syncSelectedIndex);

    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", syncSelectedIndex);
    };
  }, [emblaApi]);

  return (
    <section
      id="zonas"
      ref={sectionRef}
      className="section-anchor relative overflow-hidden bg-[#18181b] py-24 md:py-32"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(215,25,32,0.08),_transparent_40%)]" />

      <div className="section-shell relative z-10 max-w-none px-4 sm:pl-6 sm:pr-0 md:pl-12 lg:pl-16 xl:pl-24">
        <div className="mb-12 flex flex-col gap-8 sm:pr-6 md:mb-16 md:flex-row md:items-end md:justify-between md:pr-12 lg:pr-16 xl:pr-24">
          <div className="max-w-2xl">
            <p className="section-kicker text-accent">{trainingZonesSectionCopy.kicker}</p>
            <h2 className="section-title text-white">
              Espacios para <span className="text-accent italic">rendir</span> mejor en cada sesion
            </h2>
            <p className="section-copy mt-6 text-zinc-400">{trainingZonesSectionCopy.intro}</p>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={scrollPrev}
              className="group flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5 text-white transition-colors hover:border-accent hover:bg-accent"
              aria-label="Anterior zona"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </button>
            <button
              onClick={scrollNext}
              className="group flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5 text-white transition-colors hover:border-accent hover:bg-accent"
              aria-label="Siguiente zona"
            >
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex touch-pan-y gap-4 pr-6 sm:gap-6 md:pr-12 lg:pr-16 xl:pr-24">
            {zones.map((zone, index) => (
              <div key={zone.id} className="embla__slide flex-[0_0_auto]">
                <ZoneCard
                  zone={zone}
                  shouldLoadVideo={hasEnteredViewport && Math.abs(activeIndex - index) <= 1}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 pr-6 md:hidden">
          <button
            onClick={scrollPrev}
            className="flex h-12 w-12 items-center justify-center border border-white/10 bg-white/5 text-white transition-colors active:border-accent active:bg-accent"
            aria-label="Anterior zona"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="flex h-12 w-12 items-center justify-center border border-white/10 bg-white/5 text-white transition-colors active:border-accent active:bg-accent"
            aria-label="Siguiente zona"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
