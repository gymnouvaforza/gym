import type { MarketingScheduleRow } from "@/lib/data/marketing-content";

interface ScheduleSectionProps {
  rows: MarketingScheduleRow[];
}

export default function ScheduleSection({ rows }: Readonly<ScheduleSectionProps>) {
  const visibleRows = rows.filter((row) => row.is_active);

  return (
    <section id="horarios" className="section-anchor bg-background py-24 md:py-32">
      <div className="section-shell">
        <div className="mb-16">
          <p className="section-kicker">Planifica tu sesion</p>
          <h2 className="section-title text-3xl sm:text-5xl lg:text-7xl italic">
            Horarios de{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Apertura
            </span>
          </h2>
        </div>

        {visibleRows.length === 0 ? (
          <div className="bg-white p-8 shadow-sm rounded-[var(--radius-base)]">
            <p className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
              Horarios en actualizacion
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Contactanos para confirmar la disponibilidad actual mientras terminamos de publicar la agenda visible.
            </p>
          </div>
        ) : null}

        <div className="space-y-3 md:hidden">
          {visibleRows.map((row) => (
            <article key={row.id} className="bg-white p-6 shadow-sm rounded-[var(--radius-base)]">
              <p className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                {row.label}
              </p>
              {row.description ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{row.description}</p>
              ) : null}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-semibold uppercase tracking-wide">
                <p className="text-muted-foreground">Apertura</p>
                <p className="text-right text-accent">{row.opens_at}</p>
                <p className="text-muted-foreground">Cierre</p>
                <p className="text-right text-accent">{row.closes_at}</p>
              </div>
            </article>
          ))}
        </div>

        {visibleRows.length > 0 ? (
          <div className="hidden overflow-hidden bg-white shadow-xl md:block rounded-[var(--radius-base)]">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-accent px-8 py-8 text-xs font-bold uppercase tracking-[0.3em] text-white sm:px-12">
              <p>Dias de entrenamiento</p>
              <p>Apertura</p>
              <p className="text-right">Cierre</p>
            </div>

            <div className="divide-y divide-black/5">
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr] items-center px-8 py-8 transition-colors hover:bg-accent/5 odd:bg-zinc-50/50 sm:px-12"
                >
                  <div>
                    <p className="font-display text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                      {row.label}
                    </p>
                    {row.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{row.description}</p>
                    ) : null}
                  </div>
                  <p className="text-lg font-medium text-muted">{row.opens_at}</p>
                  <p className="text-right font-display text-xl font-medium text-accent">
                    {row.closes_at}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 bg-black p-8 text-center lg:text-left rounded-[var(--radius-base)]">
          <p className="font-display text-base font-bold uppercase tracking-[0.2em] text-white opacity-80">
            Nota: los dias festivos pueden tener horarios especiales. Contactanos para confirmar.
          </p>
        </div>
      </div>
    </section>
  );
}
