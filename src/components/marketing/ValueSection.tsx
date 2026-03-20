import { BarChart3, Dumbbell, ShieldCheck, Sparkles } from "lucide-react";

import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";

const icons = {
  dumbbell: Dumbbell,
  spark: Sparkles,
  shield: ShieldCheck,
  trend: BarChart3,
} as const;

export default function ValueSection() {
  return (
    <section id="propuesta" className="section-anchor bg-[#f5f5f0] py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-16 text-center">
          <div className="mx-auto flex max-w-4xl items-center justify-center gap-6">
            <span className="hidden h-[5px] w-28 bg-[#ed1c24] md:block" />
            <div>
              <p className="section-kicker">La experiencia Nova Forza</p>
              <h2 className="mt-4 font-display text-4xl uppercase leading-[0.92] text-[#111111] sm:text-5xl md:text-6xl">
                Lo que se siente
                <br />
                entrenar aqui
              </h2>
            </div>
            <span className="hidden h-[5px] w-28 bg-[#ed1c24] md:block" />
          </div>
        </div>

        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-4">
          {novaForzaHomeContent.valueProps.map((item) => {
            const Icon = icons[item.icon];

            return (
              <article
                key={item.title}
                className="mx-auto flex max-w-[310px] flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center text-[#3f3f46]">
                  <Icon className="h-12 w-12 stroke-[1.8]" />
                </div>
                <h3 className="mt-8 font-display text-[30px] uppercase leading-none text-[#111111]">
                  {item.title}
                </h3>
                <span className="mt-4 h-[3px] w-56 bg-[#ed1c24]" />
                <p className="mt-5 text-[15px] leading-8 text-[#4b5563]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
