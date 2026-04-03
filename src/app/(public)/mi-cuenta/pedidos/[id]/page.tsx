import Link from "next/link";
import { Activity, Clock3, Mail, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireMemberUser } from "@/lib/auth";
import { formatCartAmount } from "@/lib/cart/format";
import {
  getPickupRequestEmailTone,
  getPickupRequestPaymentTone,
  getPickupRequestStatusTone,
  pickupRequestEmailStatusLabels,
  pickupRequestPaymentStatusLabels,
  pickupRequestStatusLabels,
} from "@/lib/cart/pickup-request";
import { getMemberPickupRequestById } from "@/lib/data/pickup-requests";
import { buildPickupRequestTimeline } from "@/lib/data/pickup-request-dashboard";
import { formatMemberAccountDate } from "@/lib/member-account";

export const dynamic = "force-dynamic";

function getMemberPickupNextStep(input: {
  status: keyof typeof pickupRequestStatusLabels;
  paymentStatus: keyof typeof pickupRequestPaymentStatusLabels;
  emailStatus: keyof typeof pickupRequestEmailStatusLabels;
}) {
  if (input.paymentStatus === "requires_more") {
    return "Tu pago está siendo verificado por seguridad. En breve actualizaremos el estado de tu pedido.";
  }

  if (input.paymentStatus === "error" || input.paymentStatus === "canceled") {
    return "Hubo un problema con el pago. Por favor, contacta con el equipo del club para solucionarlo.";
  }

  if (input.emailStatus === "failed") {
    return "No hemos podido enviarte el resumen por email, pero tu pedido está confirmado y registrado correctamente.";
  }

  switch (input.status) {
    case "requested":
      return "Hemos recibido tu solicitud. El equipo del club la revisará en breve para empezar a prepararlo.";
    case "confirmed":
      return "¡Tu pedido ha sido confirmado! Ya lo estamos preparando para que puedas pasar a recogerlo.";
    case "ready_for_pickup":
      return "¡Buenas noticias! Tu pedido ya está listo en el club. Pasa a recogerlo cuando quieras.";
    case "fulfilled":
      return "Recogida completada con éxito. ¡Gracias por confiar en el equipamiento de Titan Gym!";
    case "cancelled":
      return "Este pedido ha sido cancelado. Si tienes dudas, ponte en contacto con nosotros.";
    default:
      return "Puedes seguir el progreso de tu pedido desde aquí hasta que lo recojas en el club.";
  }
}

export default async function MemberPickupRequestDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const user = await requireMemberUser(`/acceso?next=/mi-cuenta/pedidos/${id}`);
  const pickupRequest = await getMemberPickupRequestById({
    id,
    email: user.email,
    supabaseUserId: user.id,
  });

  if (!pickupRequest) {
    notFound();
  }

  const timeline = buildPickupRequestTimeline(pickupRequest);
  const nextStep = getMemberPickupNextStep({
    status: pickupRequest.status,
    paymentStatus: pickupRequest.paymentStatus,
    emailStatus: pickupRequest.emailStatus,
  });

  return (
    <main className="min-h-screen bg-[#fbfbf8] py-12 lg:py-20 px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto space-y-16">
        
        {/* HEADER: IDENTIDAD DEL PEDIDO */}
        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-black/10 pb-12">
           <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                 <Badge variant={getPickupRequestStatusTone(pickupRequest.status)} className="h-6 px-4 rounded-none font-black uppercase text-[9px] tracking-widest">
                    {pickupRequestStatusLabels[pickupRequest.status]}
                 </Badge>
                 <Badge variant={getPickupRequestPaymentTone(pickupRequest.paymentStatus)} className="h-6 px-4 rounded-none font-black uppercase text-[9px] tracking-widest bg-black/5 text-black border-none">
                    PAGO: {pickupRequestPaymentStatusLabels[pickupRequest.paymentStatus]}
                 </Badge>
              </div>
              <p className="font-black text-[10px] uppercase tracking-[0.4em] text-[#d71920]">Detalle de tu Pedido</p>
              <h1 className="font-display text-6xl font-black uppercase tracking-tighter text-[#111111] sm:text-8xl italic leading-none">
                {pickupRequest.requestNumber}
              </h1>
           </div>
           <div className="flex flex-col items-start md:items-end gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">Fecha del Pedido</p>
              <p className="text-xl font-bold text-[#111111] uppercase tracking-tighter">{formatMemberAccountDate(pickupRequest.createdAt)}</p>
           </div>
        </header>

        {/* SECCIÓN: ESTADO DINÁMICO (NEXT STEP) */}
        <section className="bg-[#111111] text-white p-10 lg:p-16 shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6 max-w-2xl">
                 <div className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#d71920] animate-ping" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Estado de tu Recogida</p>
                 </div>
                 <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tight italic leading-tight">
                    {nextStep}
                 </h2>
              </div>
              <div className="flex flex-col items-center justify-center p-8 border border-white/10 bg-white/5 backdrop-blur-sm min-w-[240px]">
                 <Clock3 className="h-8 w-8 text-[#d71920] mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Última Actualización</p>
                 <p className="text-sm font-bold text-white uppercase">{formatMemberAccountDate(pickupRequest.updatedAt)}</p>
              </div>
           </div>
           <div className="absolute top-0 right-0 h-full w-1/3 bg-[#d71920]/5 -skew-x-12 translate-x-20" />
        </section>

        {/* SECCIÓN: TIMELINE DE PROGRESO */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-black/10 pb-6">
              <div className="h-10 w-10 bg-[#111111] flex items-center justify-center">
                 <Activity className="h-5 w-5 text-[#d71920]" />
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Progreso del Pedido</h3>
           </div>
           
           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {timeline.map((step) => {
                const isPast = !!step.date;
                return (
                  <article 
                    key={step.key} 
                    className={cn(
                      "p-8 border transition-all",
                      isPast ? "bg-white border-black/10 shadow-md" : "bg-[#fbfbf8] border-black/5 opacity-50 border-dashed"
                    )}
                  >
                    <p className={cn(
                      "text-[9px] font-black uppercase tracking-widest mb-4",
                      isPast ? "text-[#d71920]" : "text-[#7a7f87]"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-sm font-bold text-[#111111] uppercase tracking-tight mb-2 leading-tight">
                      {step.description}
                    </p>
                    <p className="text-[10px] font-mono text-[#7a7f87]">
                      {step.date ? formatMemberAccountDate(step.date) : "PRÓXIMAMENTE"}
                    </p>
                  </article>
                );
              })}
           </div>
        </section>

        {/* SECCIÓN: DETALLE TÉCNICO Y PRODUCTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">
           
           {/* COLUMNA IZQUIERDA: PRODUCTOS */}
           <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-black/10 pb-6">
                 <ShoppingBag className="h-6 w-6 text-[#111111]" />
                 <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Resumen de Productos</h3>
              </div>
              
              <div className="space-y-4">
                 {pickupRequest.lineItems.map((lineItem) => (
                    <article key={lineItem.id} className="bg-white border border-black/10 p-8 hover:border-[#111111] transition-colors group">
                       <div className="flex flex-col sm:flex-row justify-between gap-8">
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-black/10 group-hover:bg-[#d71920]" />
                                <h4 className="text-lg font-black uppercase text-[#111111] tracking-tight">{lineItem.title}</h4>
                             </div>
                             {lineItem.selectedOptions.length > 0 && (
                                <p className="text-xs font-medium text-[#7a7f87] pl-5 uppercase tracking-wide">
                                   {lineItem.selectedOptions
                                     .map((option) => option.optionTitle ? `${option.optionTitle}: ${option.value}` : option.value)
                                     .join(" / ")}
                                </p>
                             )}
                             {lineItem.variantSku && (
                                <p className="text-[10px] font-mono text-[#7a7f87] pl-5">SKU: {lineItem.variantSku}</p>
                             )}
                          </div>
                          <div className="text-right flex flex-col justify-center">
                             <p className="text-sm font-black text-[#d71920] mb-1">
                                {lineItem.quantity} x {formatCartAmount(lineItem.unitPrice, pickupRequest.currencyCode)}
                             </p>
                             <p className="text-xl font-display font-black text-[#111111]">
                                {formatCartAmount(lineItem.total, pickupRequest.currencyCode)}
                             </p>
                          </div>
                       </div>
                    </article>
                 ))}
              </div>
           </section>

           {/* COLUMNA DERECHA: FICHA DE DATOS Y TOTALES */}
           <aside className="space-y-12">
              
              {/* DATOS DE CONTACTO */}
              <div className="bg-[#111111] p-10 text-white space-y-8 shadow-2xl">
                 <div className="space-y-6">
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Canal de Notificación</p>
                       <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-[#d71920]" />
                          <p className="text-sm font-bold truncate">{pickupRequest.email}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Estado del Aviso</p>
                       <Badge className="border-white/20 bg-transparent text-white/60 font-black uppercase text-[8px] h-6 px-3">
                          {pickupRequestEmailStatusLabels[pickupRequest.emailStatus]}
                       </Badge>
                    </div>
                 </div>

                 {pickupRequest.notes && (
                    <div className="pt-8 border-t border-white/10 space-y-3">
                       <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Nota del Socio</p>
                       <p className="text-xs text-white/60 leading-relaxed italic">&ldquo;{pickupRequest.notes}&rdquo;</p>
                    </div>
                 )}
              </div>

              {/* RESUMEN ECONÓMICO */}
              <div className="bg-white border border-black/10 p-10 shadow-lg space-y-8">
                 <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#7a7f87] border-b border-black/5 pb-4">Resumen del Pago</p>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-[#7a7f87]">
                       <span>Subtotal</span>
                       <span>{formatCartAmount(pickupRequest.subtotal, pickupRequest.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-black/10">
                       <span className="text-xs font-black uppercase tracking-widest text-[#111111]">Total Pagado</span>
                       <span className="text-3xl font-display font-black text-[#111111]">
                          {formatCartAmount(pickupRequest.total, pickupRequest.currencyCode)}
                       </span>
                    </div>

                    {pickupRequest.chargedCurrencyCode && pickupRequest.chargedTotal !== null && (
                       <div className="bg-[#fbfbf8] p-4 mt-6 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase text-[#7a7f87]">
                             <span>Cargo Procesado (PayPal)</span>
                             <span className="text-[#111111]">{formatCartAmount(pickupRequest.chargedTotal, pickupRequest.chargedCurrencyCode)}</span>
                          </div>
                          {pickupRequest.exchangeRate && (
                             <p className="text-[9px] text-[#7a7f87] italic">Conversión aplicada: S/ {pickupRequest.exchangeRate.toFixed(3)} por USD</p>
                          )}
                       </div>
                    )}
                 </div>
              </div>

              {/* ACCIONES DE CIERRE */}
              <div className="grid gap-4">
                 <Button asChild className="h-16 rounded-none bg-[#111111] text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#d71920] transition-all shadow-xl">
                    <Link href="/mi-cuenta#pedidos-pickup">Volver a mi cuenta</Link>
                 </Button>
                 <Button asChild variant="outline" className="h-16 rounded-none border-black/10 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-[#111111] hover:text-white transition-all">
                    <Link href="/tienda">Seguir Comprando</Link>
                 </Button>
              </div>

           </aside>
        </div>

      </div>
    </main>
  );
}
