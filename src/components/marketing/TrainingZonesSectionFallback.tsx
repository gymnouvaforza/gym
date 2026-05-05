import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOrderedTrainingZones, trainingZonesSectionCopy } from "@/data/training-zones";

const previewZones = getOrderedTrainingZones().slice(0, 3);

export default function TrainingZonesSectionFallback() {
  return (
    <section
      id="zonas"
      className="section-anchor relative overflow-hidden bg-secondary py-24 md:py-32"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_rgba(215,25,32,0.08),_transparent_40%)]" />

      <div className="section-shell relative z-10">
        <div className="max-w-2xl">
          <p className="section-kicker text-accent">{trainingZonesSectionCopy.kicker}</p>
          <h2 className="section-title text-3xl sm:text-5xl lg:text-7xl !text-white">
            Espacios para <span className="text-primary italic">rendir</span> mejor en cada sesion
          </h2>
          <p className="section-copy mt-6 text-zinc-400">{trainingZonesSectionCopy.intro}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {previewZones.map((zone) => (
            <article
              key={zone.id}
              className="group relative overflow-hidden border border-white/8 bg-black rounded-[var(--radius-base)]"
            >
              <div className="relative aspect-[5/6]">
                {zone.poster_url ? (
                  <Image
                    src={zone.poster_url}
                    alt={zone.title}
                    fill
                    className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    quality={60}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                    {zone.short_label}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-black uppercase italic text-white">
                    {zone.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{zone.description}</p>
                  {zone.cta_label && zone.cta_href ? (
                    <div className="mt-6">
                      <Button asChild className="btn-athletic btn-primary !h-11 !px-5 !text-[11px] rounded-[var(--radius-base)]">
                        <Link href={zone.cta_href}>{zone.cta_label}</Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
