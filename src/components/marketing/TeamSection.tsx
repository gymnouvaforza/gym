import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { MarketingTeamMember } from "@/lib/data/marketing-content";

interface TeamSectionProps {
  members: MarketingTeamMember[];
}

export default function TeamSection({ members }: Readonly<TeamSectionProps>) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section 
      id="entrenadores" 
      data-component="team-section"
      className="section-anchor relative overflow-hidden bg-secondary py-24 md:py-32"
    >
      <div className="absolute inset-0 athletic-grid opacity-10" />
      <div className="section-shell relative z-10">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Nuestros Expertos</p>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-7xl italic">
              <span className="text-white">El Equipo</span> <span className="text-primary underline decoration-accent/20 underline-offset-8">Elite</span>
            </h2>
          </div>
          <Link
            href="#contacto"
            className="group inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent transition-all hover:gap-5"
          >
            Habla con el equipo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <article 
              key={member.name} 
              className="group relative overflow-hidden bg-foreground/5 transition-all duration-500 hover:bg-foreground/10 rounded-[var(--radius-base)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={member.image_url ?? "/images/trainers/trainer-1.png"}
                  alt={member.name}
                  fill
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-display text-sm font-bold uppercase tracking-widest text-accent">
                    {member.role}
                  </p>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-primary">{member.name}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 h-10 w-10 border-r-2 border-t-2 border-accent/0 transition-all duration-500 group-hover:border-accent/40" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
