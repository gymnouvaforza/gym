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
    <section id="entrenadores" className="section-anchor relative overflow-hidden bg-[#111111] py-24 md:py-32">
      <div className="absolute inset-0 athletic-grid opacity-10" />
      <div className="section-shell relative z-10">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Nuestros Expertos</p>
            <h2 className="section-title text-white italic">
              El Equipo <span className="text-accent underline decoration-accent/20 underline-offset-8">Elite</span>
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
            <article key={member.name} className="group relative overflow-hidden bg-white/5 transition-all duration-500 hover:bg-white/10">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={member.image_url ?? "/images/trainers/trainer-1.png"}
                  alt={member.name}
                  fill
                  className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-display text-sm font-bold uppercase tracking-widest text-accent">
                    {member.role}
                  </p>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-white">{member.name}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-white/50">{member.bio}</p>
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
