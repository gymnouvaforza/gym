import { BarChart3, Dumbbell, ShieldCheck, Sparkles, Activity } from "lucide-react";

import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";

const icons = {
  dumbbell: Dumbbell,
  spark: Sparkles,
  shield: ShieldCheck,
  trend: BarChart3,
} as const;

export default function ValueSection() {
  return (
    <section id="propuesta" className="section-anchor bg-[#fbfbf8] py-24 md:py-32">
      <div className="section-shell">
        
        {/* HEADER INDUSTRIAL */}
        <div className="mb-20 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-1.5 w-1.5 bg-[#d71920]" />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#7a7f87]">
               La Propuesta de Valor
             </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/10 pb-12">
             <h2 className="font-display text-6xl font-black uppercase leading-none tracking-tighter text-[#111111] sm:text-8xl italic">
               LO QUE SE SIENTE <br />
               <span className="text-black/10">ENTRENAR AQUI</span>
             </h2>
             <div className="flex items-center gap-4 text-[#d71920]">
                <Activity className="h-8 w-8 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest max-w-[140px] leading-tight">
                   Experiencia tecnica sin compromisos
                </p>
             </div>
          </div>
        </div>

        {/* GRID DE VALORES */}
        <div className="grid gap-px bg-black/5 md:grid-cols-2 xl:grid-cols-4 border border-black/5 shadow-2xl">
          {novaForzaHomeContent.valueProps.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons] || Dumbbell;

            return (
              <article
                key={item.title}
                className="bg-white p-10 lg:p-12 space-y-8 group hover:bg-[#111111] transition-all duration-500"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 bg-black/5 flex items-center justify-center group-hover:bg-[#d71920] transition-colors">
                    <Icon className="h-6 w-6 text-[#111111] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase leading-none tracking-tight italic text-[#111111] group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                </div>
                
                <div className="space-y-6">
                   <div className="h-0.5 w-12 bg-[#d71920] group-hover:w-full transition-all duration-700" />
                   <p className="text-sm font-medium leading-relaxed text-[#5f6368] group-hover:text-white/60 transition-colors">
                     {item.description}
                   </p>
                </div>
              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
