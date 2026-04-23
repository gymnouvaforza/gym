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
    <section 
      id="propuesta-section" 
      data-component="value-section"
      className="section-anchor bg-background py-24 md:py-32"
      aria-labelledby="value-title"
    >
      <div className="section-shell">
        
        {/* HEADER INDUSTRIAL */}
        <div className="mb-20 space-y-6">
          <div className="flex items-center gap-4">
             <div className="h-1.5 w-1.5 bg-primary" />
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">
               La Propuesta de Valor
             </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
             <h2 id="value-title" className="font-display text-4xl sm:text-6xl lg:text-8xl font-black uppercase leading-[1.1] sm:leading-none tracking-tighter text-foreground italic">
               LO QUE SE SIENTE <br className="hidden sm:block" />
               <span className="block sm:inline text-foreground/10">ENTRENAR AQUI</span>
             </h2>
             <div className="flex items-center gap-4 text-primary">
                <Activity className="h-8 w-8 animate-pulse" aria-hidden="true" />
                <p className="text-[10px] font-black uppercase tracking-widest max-w-[140px] leading-tight">
                   Experiencia tecnica sin compromisos
                </p>
             </div>
          </div>
        </div>

        {/* GRID DE VALORES */}
        <div className="grid w-full gap-px bg-border md:grid-cols-2 xl:grid-cols-4 border border-border shadow-2xl rounded-[var(--radius-base)] overflow-hidden">
          {novaForzaHomeContent.valueProps.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons] || Dumbbell;

            return (
              <article
                key={item.title}
                className="bg-card w-full p-6 xs:p-8 lg:p-12 space-y-6 xs:space-y-8 group hover:bg-secondary transition-all duration-500 overflow-hidden"
              >
                <div className="flex items-center gap-4 xs:gap-5">
                  <div className="h-10 w-10 xs:h-12 xs:w-12 shrink-0 bg-muted/10 flex items-center justify-center group-hover:bg-primary transition-colors rounded-[var(--radius-base)]">
                    <Icon className="h-5 w-5 xs:h-6 xs:w-6 shrink-0 text-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-display text-xl xs:text-2xl font-black uppercase leading-none tracking-tight italic text-foreground group-hover:text-secondary-foreground transition-colors break-words overflow-hidden">
                    {item.title}
                  </h3>
                </div>
                
                <div className="space-y-4 xs:space-y-6">
                   <div className="h-0.5 w-12 bg-primary group-hover:w-full transition-all duration-700" />
                   <p className="text-xs xs:text-sm font-medium leading-relaxed text-muted-foreground group-hover:text-secondary-foreground/60 transition-colors break-words whitespace-normal">
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
