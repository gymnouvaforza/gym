import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";

export default function ScheduleSection() {
  return (
    <section id="horarios" className="section-anchor bg-[#f5f5f0] py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-16">
          <p className="section-kicker">Planifica tu sesión</p>
          <h2 className="section-title italic">
            Horarios de <span className="text-accent underline decoration-accent/20 underline-offset-8">Apertura</span>
          </h2>
        </div>

        <div className="overflow-hidden bg-white shadow-xl">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-accent px-8 py-8 text-xs font-bold uppercase tracking-[0.3em] text-white sm:px-12">
            <p>Días de entrenamiento</p>
            <p>Apertura</p>
            <p className="text-right">Cierre</p>
          </div>

          <div className="divide-y divide-black/5">
            {novaForzaHomeContent.operatingHours.map((row) => (
              <div
                key={row.day}
                className="grid grid-cols-[1.5fr_1fr_1fr] items-center px-8 py-8 transition-colors hover:bg-accent/5 odd:bg-zinc-50/50 sm:px-12"
              >
                <p className="font-display text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">{row.day}</p>
                <p className="text-lg font-medium text-muted">{row.open}</p>
                <p className="text-right font-display text-xl font-medium text-accent">{row.close}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-black p-8 text-center lg:text-left">
          <p className="font-display text-base font-bold uppercase tracking-[0.2em] text-white opacity-80">
            Nota: Los días festivos pueden tener horarios especiales. Contáctanos para confirmar.
          </p>
        </div>
      </div>
    </section>
  );
}
