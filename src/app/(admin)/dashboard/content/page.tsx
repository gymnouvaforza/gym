import type { ReactNode } from "react";

import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitialTrainingZone, getOrderedTrainingZones } from "@/data/training-zones";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import { getDashboardData } from "@/lib/data/site";
import { formatTopbarDeadline, resolveTopbarStatus } from "@/lib/topbar";

function SectionCard({
  title,
  count,
  children,
}: Readonly<{
  title: string;
  count: number;
  children: ReactNode;
}>) {
  return (
    <Card className="border-white/10 bg-zinc-950/80">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <Badge variant="muted">{count}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export default async function DashboardContentPage() {
  const { settings } = await getDashboardData();
  const topbarStatus = resolveTopbarStatus(settings);
  const topbarDeadline = settings.topbar_expires_at
    ? formatTopbarDeadline(settings.topbar_expires_at)
    : null;
  const zones = getOrderedTrainingZones();
  const activeZone = getInitialTrainingZone();

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Contenido"
        description="Referencia operativa de la home actual. Aqui puedes revisar rapidamente el hero activo, zonas de entrenamiento, planes, horarios, equipo, tienda y testimonios."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Topbar" count={1}>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Estado</p>
              <Badge variant="muted">
                {topbarStatus === "active"
                  ? "Activo"
                  : topbarStatus === "expired"
                    ? "Caducado"
                    : "Inactivo"}
              </Badge>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">
              {settings.topbar_text ?? "Sin promo cargada"}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-500">
              {topbarDeadline ? `Hasta ${topbarDeadline}` : "Sin fecha limite"}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Hero activo" count={1}>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Badge</p>
            <p className="mt-2 font-semibold text-white">{settings.hero_badge}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Media</p>
            <p className="mt-2 text-sm text-zinc-300">Video vertical cargado desde ajustes globales.</p>
            <p className="mt-2 break-all text-xs text-zinc-500">
              {settings.hero_video_url ?? "/video/video.mp4"}
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Zonas de entrenamiento" count={zones.length}>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Zona inicial</p>
              <Badge variant="muted">{activeZone.short_label}</Badge>
            </div>
            <p className="mt-3 font-semibold text-white">{activeZone.title}</p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">{activeZone.description}</p>
          </div>

          {zones.map((zone) => (
            <div key={zone.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{zone.title}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#fca5a5]">
                    {zone.short_label}
                  </p>
                </div>
                {zone.active ? <Badge variant="muted">Activa</Badge> : null}
              </div>
              {zone.subtitle ? (
                <p className="mt-3 text-sm leading-7 text-zinc-400">{zone.subtitle}</p>
              ) : null}
              <p className="mt-3 break-all text-xs text-zinc-500">{zone.video}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Propuesta de valor" count={novaForzaHomeContent.valueProps.length}>
          {novaForzaHomeContent.valueProps.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-zinc-400">{item.description}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Membresias" count={novaForzaHomeContent.plans.length}>
          {novaForzaHomeContent.plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-white">{plan.name}</p>
                <p className="text-sm font-medium text-[#fca5a5]">
                  {plan.price}
                  {plan.billing}
                </p>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                {plan.features.map((feature) => (
                  <li key={feature.label}>
                    {feature.included ? "Incluye" : "No incluye"}: {feature.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Horarios" count={novaForzaHomeContent.operatingHours.length}>
          {novaForzaHomeContent.operatingHours.map((item) => (
            <div
              key={item.day}
              className="grid grid-cols-[1.2fr_0.8fr_0.8fr] rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-zinc-300"
            >
              <span className="font-semibold text-white">{item.day}</span>
              <span>{item.open}</span>
              <span>{item.close}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Equipo" count={novaForzaHomeContent.team.length}>
          {novaForzaHomeContent.team.map((member) => (
            <div key={member.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="font-semibold text-white">{member.name}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#fca5a5]">{member.role}</p>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{member.bio}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Tienda" count={novaForzaHomeContent.featuredProducts.length}>
          {novaForzaHomeContent.featuredProducts.map((product) => (
            <div key={product.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{product.category}</p>
              <p className="mt-2 font-semibold text-white">{product.name}</p>
              <p className="mt-2 text-sm font-medium text-[#fca5a5]">{product.price}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Testimonios" count={novaForzaHomeContent.testimonials.length}>
          {novaForzaHomeContent.testimonials.map((testimonial) => (
            <div key={testimonial.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-sm leading-7 text-zinc-300">&ldquo;{testimonial.quote}&rdquo;</p>
              <p className="mt-3 font-semibold text-white">{testimonial.name}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{testimonial.detail}</p>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
