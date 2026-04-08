import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

import MembershipReserveButton from "@/components/public/MembershipReserveButton";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";
import type { MembershipPlan } from "@/lib/memberships";

interface MembershipPlansCatalogProps {
  membershipPlans: MembershipPlan[];
  user: User | null;
  whatsappUrl: string | null;
}

function buildMembershipWhatsAppUrl(
  baseUrl: string | null,
  plan: MembershipPlan,
) {
  const safeBaseUrl = baseUrl?.trim();

  if (!safeBaseUrl) {
    return null;
  }

  try {
    const url = new URL(safeBaseUrl);
    url.searchParams.set(
      "text",
      `Hola, quiero informacion sobre la membresia ${plan.title} (${plan.billing_label ?? `${plan.duration_days} dias`} - S/ ${plan.price_amount.toFixed(2)}).`,
    );
    return url.toString();
  } catch {
    return null;
  }
}

export default function MembershipPlansCatalog({
  membershipPlans,
  user,
  whatsappUrl,
}: Readonly<MembershipPlansCatalogProps>) {
  if (membershipPlans.length === 0) {
    return (
      <div className="border border-white/10 bg-white/5 p-8 text-white">
        <PublicInlineAlert
          tone="warning"
          title="Catalogo operativo pendiente"
          message="Todavia no hay membresias activas cargadas para reservar desde la web. Cuando el equipo publique el catalogo, esta pagina mostrara la reserva real."
        />
      </div>
    );
  }

  return (
    <section className="space-y-12">
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d71920]">
          Membresias
        </p>
        <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-6xl">
          Elige Tu Plan
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65">
          Mismo formato de pricing de siempre, pero ahora conectado al flujo real de membresias.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-3 lg:items-stretch">
        {membershipPlans.map((plan) => {
          const whatsappPlanUrl = buildMembershipWhatsAppUrl(whatsappUrl, plan);

          return (
            <article
              key={plan.id}
              className={[
                "relative flex flex-col p-12 transition-all duration-500",
                plan.is_featured
                  ? "z-10 bg-white text-[#181818] shadow-[0_30px_100px_rgba(0,0,0,0.6)] lg:scale-105"
                  : "border border-white/5 bg-white/5 text-white hover:bg-white/10",
              ].join(" ")}
            >
              {plan.is_featured ? (
                <div className="absolute top-0 right-0 bg-[#d71920] px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  Destacado
                </div>
              ) : null}

              <div className="mb-10">
                <h2
                  className={[
                    "font-display text-2xl font-bold uppercase tracking-widest",
                    plan.is_featured ? "text-[#181818]/75" : "text-white/70",
                  ].join(" ")}
                >
                  {plan.title}
                </h2>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-black tracking-tighter text-[#d71920] lg:text-7xl">
                    S/{plan.price_amount.toFixed(0)}
                  </span>
                  <span className={plan.is_featured ? "text-[#6a645d]" : "text-white/40"}>
                    {plan.billing_label ?? `${plan.duration_days} dias`}
                  </span>
                </div>
                <p className={plan.is_featured ? "mt-4 text-sm leading-7 text-[#5a544d]" : "mt-4 text-sm leading-7 text-white/65"}>
                  {plan.description ??
                    "Membresia operativa con QR, vigencia real y seguimiento desde tu cuenta."}
                </p>
              </div>

              <div className="mb-12 space-y-5">
                <div className={plan.is_featured ? "flex items-center gap-4 text-[15px] text-[#181818]" : "flex items-center gap-4 text-[15px] text-white"}>
                  <ShieldCheck className="h-5 w-5 text-[#d71920]" />
                  <span className="font-medium tracking-tight opacity-90">
                    {plan.duration_days} dias por ciclo
                  </span>
                </div>
                <div className={plan.is_featured ? "flex items-center gap-4 text-[15px] text-[#181818]" : "flex items-center gap-4 text-[15px] text-white"}>
                  <ShieldCheck className="h-5 w-5 text-[#d71920]" />
                  <span className="font-medium tracking-tight opacity-90">
                    QR operativo y vigencia real
                  </span>
                </div>
                <div className={plan.is_featured ? "flex items-center gap-4 text-[15px] text-[#181818]" : "flex items-center gap-4 text-[15px] text-white"}>
                  <ShieldCheck className="h-5 w-5 text-[#d71920]" />
                  <span className="font-medium tracking-tight opacity-90">
                    {user
                      ? "Se anade a tu cuenta y avisa al admin"
                      : "Atencion directa por WhatsApp si aun no tienes cuenta"}
                  </span>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                {user ? (
                  <MembershipReserveButton
                    membershipPlanId={plan.id}
                    label="Reservar membresia"
                    className="w-full bg-[#d71920] text-white hover:bg-[#111111] hover:text-white"
                  />
                ) : whatsappPlanUrl ? (
                  <Button
                    asChild
                    className="h-12 w-full rounded-none bg-[#d71920] text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-white hover:text-[#111111]"
                  >
                    <Link href={whatsappPlanUrl} target="_blank" rel="noreferrer">
                      Hablar por WhatsApp
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="h-12 w-full rounded-none bg-[#d71920] text-[10px] font-black uppercase tracking-[0.18em] text-white hover:bg-white hover:text-[#111111]"
                  >
                    <Link href="/contacto">Solicitar informacion</Link>
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
