import { Star } from "lucide-react";

import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";

export default function TestimonialsSection() {
  return (
    <section id="testimonios" className="section-anchor relative overflow-hidden bg-[#111111] py-24 md:py-32">
      <div className="absolute inset-0 athletic-grid opacity-10" />
      <div className="section-shell relative z-10">
        <div className="mb-16">
          <p className="section-kicker">Resultados Reales</p>
          <h2 className="section-title text-white italic">
            La Comunidad <span className="text-accent underline decoration-accent/20 underline-offset-8">Nova Forza</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {novaForzaHomeContent.testimonials.map((testimonial) => (
            <article key={testimonial.name} className="flex flex-col bg-white/5 p-10 border border-white/5 transition-all duration-500 hover:bg-white/10">
              <div className="flex gap-1.5 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              
              <p className="mt-8 text-xl leading-relaxed text-white/80 font-medium italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="mt-auto pt-10 flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-accent font-display text-xl font-bold uppercase text-white">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-display text-xl font-bold uppercase tracking-tight text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60">
                    {testimonial.detail}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
