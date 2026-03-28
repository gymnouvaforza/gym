import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MarketingPlan } from "@/lib/data/marketing-content";
import type { SiteSettings } from "@/lib/supabase/database.types";

interface PlansSectionProps {
  settings: SiteSettings;
  plans: MarketingPlan[];
}

export default function PlansSection({ settings, plans }: Readonly<PlansSectionProps>) {
  const visiblePlans = plans.filter((plan) => plan.is_active);

  return (
    <section id="planes" className="section-anchor relative overflow-hidden bg-[#111111] py-24 md:py-32">
      <div className="absolute inset-0 athletic-grid opacity-10" />
      <div className="section-shell relative z-10">
        <div className="mb-16 text-center">
          <p className="section-kicker">Tu camino al éxito</p>
          <h2 className="section-title text-white italic">
            Nuestros <span className="text-accent">Planes</span>
          </h2>
        </div>

        <div className="grid gap-0 lg:grid-cols-3 lg:items-stretch">
          {visiblePlans.length > 0 ? visiblePlans.map((plan) => (
            <article
              key={plan.id}
              className={[
                "relative flex flex-col p-12 transition-all duration-500",
                plan.is_featured
                  ? "z-10 bg-white text-foreground shadow-[0_30px_100px_rgba(0,0,0,0.6)] lg:scale-105"
                  : "bg-white/5 text-white border border-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              {plan.badge ? (
                <div className="absolute top-0 right-0 bg-accent px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  {plan.badge}
                </div>
              ) : null}

              <div className="mb-10">
                <h3 className="font-display text-2xl font-bold uppercase tracking-widest opacity-70">
                  {plan.title}
                </h3>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-black tracking-tighter text-accent lg:text-7xl">
                    {plan.price_label}
                  </span>
                  <span className={plan.is_featured ? "text-muted" : "text-white/40"}>
                    {plan.billing_label}
                  </span>
                </div>
                {plan.description ? (
                  <p className={plan.is_featured ? "mt-4 text-sm text-muted" : "mt-4 text-sm text-white/60"}>
                    {plan.description}
                  </p>
                ) : null}
              </div>

              <ul className="mb-12 space-y-5">
                {plan.features.map((feature) => {
                  const Icon = feature.included ? CheckCircle2 : XCircle;

                  return (
                    <li
                      key={feature.label}
                      className={[
                        "flex items-center gap-4 text-[15px]",
                        feature.included 
                          ? (plan.is_featured ? "text-foreground" : "text-white") 
                          : "text-zinc-600 line-through decoration-accent/20",
                      ].join(" ")}
                    >
                      <Icon className={feature.included ? "h-5 w-5 text-accent" : "h-4 w-4 text-zinc-700"} />
                      <span className="font-medium tracking-tight opacity-90">{feature.label}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto">
                <Button
                  asChild
                  className={[
                    "btn-athletic w-full",
                    plan.is_featured
                      ? "btn-primary shadow-xl shadow-accent/20"
                      : "btn-outline !border-white/20 !text-white hover:!bg-white hover:!text-black",
                  ].join(" ")}
                >
                  <Link href={settings.whatsapp_url ?? "#contacto"}>Seleccionar Plan</Link>
                </Button>
              </div>
            </article>
          )) : (
            <article className="border border-white/10 bg-white/5 p-12 text-white lg:col-span-3">
              <p className="font-display text-2xl font-bold uppercase tracking-[0.16em]">
                Nuevos planes en actualizacion
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                Estamos ordenando la oferta comercial. Escríbenos por WhatsApp y te ayudamos a encontrar la opcion adecuada.
              </p>
              <div className="mt-8">
                <Button asChild className="btn-athletic btn-primary">
                  <Link href={settings.whatsapp_url ?? "#contacto"}>Hablar con el gym</Link>
                </Button>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
