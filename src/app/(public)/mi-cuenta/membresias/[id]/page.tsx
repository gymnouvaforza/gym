import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CircleDollarSign, ShieldCheck } from "lucide-react";

import MembershipQrCard from "@/components/public/MembershipQrCard";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireMemberUser } from "@/lib/auth";
import { formatCartAmount } from "@/lib/cart/format";
import {
  buildMembershipValidationUrl,
  getMemberOwnedMembershipRequestById,
  listMembershipPaymentEntries,
} from "@/lib/data/memberships";
import {
  membershipCommerceSyncStatusLabels,
  membershipEmailStatusLabels,
  membershipManualPaymentStatusLabels,
  membershipRequestStatusLabels,
  membershipValidationStatusLabels,
} from "@/lib/memberships";
import { formatMemberAccountDate } from "@/lib/member-account";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function MemberMembershipRequestDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}>) {
  const [{ id }, resolvedSearchParams, user] = await Promise.all([
    params,
    searchParams,
    requireMemberUser("/acceso?next=/mi-cuenta"),
  ]);
  const request = await getMemberOwnedMembershipRequestById({
    id,
    supabaseUserId: user.id,
  });

  if (!request) {
    notFound();
  }

  const paymentEntries = await listMembershipPaymentEntries(request.id);
  const created = resolvedSearchParams.created === "1";

  return (
    <main className="min-h-screen bg-[#fbfbf8] px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-[1360px] space-y-8">
        <div className="flex flex-col gap-4 border-b border-black/8 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link
              href="/mi-cuenta"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#7a7f87] transition-colors hover:text-[#111111]"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a mi cuenta
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#d71920]">
              Membresia vinculada
            </p>
            <h1 className="font-display text-5xl font-black uppercase tracking-tight text-[#111111]">
              {request.requestNumber}
            </h1>
            <p className="text-sm leading-7 text-[#5f6368]">
              Ciclo operativo de {request.planTitleSnapshot} con seguimiento manual de cobros y
              validacion por QR.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={request.validation.tone === "success" ? "success" : "warning"}>
              {membershipValidationStatusLabels[request.validation.status]}
            </Badge>
            <Badge variant={request.status === "active" ? "success" : "muted"}>
              {membershipRequestStatusLabels[request.status]}
            </Badge>
            <Badge
              variant={
                request.manualPaymentSummary.status === "paid" ||
                request.manualPaymentSummary.status === "overpaid"
                  ? "success"
                  : request.manualPaymentSummary.status === "partial"
                    ? "warning"
                    : "muted"
              }
            >
              {membershipManualPaymentStatusLabels[request.manualPaymentSummary.status]}
            </Badge>
          </div>
        </div>

        {created ? (
          <PublicInlineAlert
            tone="success"
            title="Solicitud registrada"
            message="Tu membresia ya quedo abierta en el sistema. Desde aqui puedes revisar el estado y tu QR operativo."
          />
        ) : null}

        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="border border-black/10 bg-white p-8 shadow-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border border-black/8 bg-[#fbfbf8] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Total del ciclo
                  </p>
                  <p className="mt-3 text-2xl font-black text-[#111111]">
                    {formatCartAmount(request.priceAmount, request.currencyCode)}
                  </p>
                </div>
                <div className="border border-black/8 bg-[#fbfbf8] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Pagado
                  </p>
                  <p className="mt-3 text-2xl font-black text-[#111111]">
                    {formatCartAmount(
                      request.manualPaymentSummary.paidTotal,
                      request.currencyCode,
                    )}
                  </p>
                </div>
                <div className="border border-black/8 bg-black/[0.03] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Pendiente
                  </p>
                  <p className="mt-3 text-2xl font-black text-[#111111]">
                    {formatCartAmount(
                      request.manualPaymentSummary.balanceDue,
                      request.currencyCode,
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="border-l-2 border-[#d71920] bg-[#fff5f5] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                    Vigencia del ciclo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#111111]">
                    {request.cycleStartsOn
                      ? formatMemberAccountDate(request.cycleStartsOn)
                      : "Pendiente"}{" "}
                    ·{" "}
                    {request.cycleEndsOn
                      ? formatMemberAccountDate(request.cycleEndsOn)
                      : "Pendiente"}
                  </p>
                </div>
                <div className="border-l-2 border-black/10 bg-[#fbfbf8] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                    Coach / plan tecnico
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#111111]">
                    {request.member.trainerName ?? "Sin coach asignado"}
                  </p>
                  <p className="mt-1 text-sm text-[#5f6368]">
                    {request.member.trainingPlanLabel ?? "Sin plan tecnico adicional"}
                  </p>
                </div>
              </div>

              {request.notes ? (
                <div className="mt-6 border border-black/8 bg-[#fbfbf8] p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Nota registrada
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#111111]">{request.notes}</p>
                </div>
              ) : null}
            </section>

            <section className="border border-black/10 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-black/8 pb-4">
                <CircleDollarSign className="h-5 w-5 text-[#d71920]" />
                <div>
                  <p className="text-lg font-black uppercase tracking-tight text-[#111111]">
                    Historial de cobros
                  </p>
                  <p className="text-sm text-[#5f6368]">
                    El equipo registra los abonos manualmente. Aqui ves el avance real del ciclo.
                  </p>
                </div>
              </div>

              {paymentEntries.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {paymentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-3 border border-black/8 bg-[#fbfbf8] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-lg font-black text-[#111111]">
                          {formatCartAmount(entry.amount, entry.currency_code)}
                        </p>
                        <p className="mt-1 text-[12px] text-[#5f6368]">
                          {entry.note ?? "Abono registrado manualmente por recepcion."}
                        </p>
                      </div>
                      <div className="text-right text-[12px] text-[#5f6368]">
                        <p>{formatDateTime(entry.recorded_at)}</p>
                        <p>{entry.created_by_email ?? "Equipo interno"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 border border-dashed border-black/10 bg-[#fbfbf8] p-6">
                  <p className="text-sm font-semibold text-[#111111]">
                    Aun no hay cobros registrados para esta membresia.
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#5f6368]">
                    Tu QR seguira marcando el estado segun la vigencia y el cobro manual que
                    registre recepcion.
                  </p>
                </div>
              )}
            </section>

            <section className="border border-black/10 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-black/8 pb-4">
                <ShieldCheck className="h-5 w-5 text-[#d71920]" />
                <div>
                  <p className="text-lg font-black uppercase tracking-tight text-[#111111]">
                    Trazabilidad comercial
                  </p>
                  <p className="text-sm text-[#5f6368]">
                    Este bloque no manda sobre tu vigencia, pero deja la reserva reflejada en la
                    capa commerce.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="border border-black/8 bg-[#fbfbf8] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Estado del mirror
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#111111]">
                    {membershipCommerceSyncStatusLabels[request.commerce.syncStatus]}
                  </p>
                  <p className="mt-1 text-[12px] text-[#5f6368]">
                    Ultima sync: {formatDateTime(request.commerce.syncedAt)}
                  </p>
                </div>

                <div className="border border-black/8 bg-[#fbfbf8] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Referencias
                  </p>
                  <p className="mt-2 break-all text-[12px] text-[#111111]">
                    Order: {request.commerce.orderId ?? "Pendiente"}
                  </p>
                  <p className="mt-1 break-all text-[12px] text-[#5f6368]">
                    Cart: {request.commerce.cartId ?? "Pendiente"}
                  </p>
                </div>
              </div>

              {request.commerce.syncError ? (
                <div className="mt-5 border border-[#f3d2d2] bg-[#fff5f5] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                    Incidencia tecnica
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#b42318]">
                    {request.commerce.syncError}
                  </p>
                </div>
              ) : null}
            </section>
          </div>

          <div className="space-y-6">
            <MembershipQrCard
              memberName={request.member.fullName}
              qrUrl={buildMembershipValidationUrl(request.member.membershipQrToken)}
              validation={request.validation}
            />

            <div className="border border-black/10 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#d71920]" />
                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#111111]">
                    Validacion ligera para recepcion
                  </p>
                  <p className="text-sm leading-7 text-[#5f6368]">
                    El QR solo expone el estado operativo, la vigencia y el plan actual. Tu
                    historial completo y las anotaciones internas no se comparten en esa vista.
                  </p>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7a7f87]">
                    Email: {membershipEmailStatusLabels[request.emailStatus]}
                  </p>
                  {request.emailError ? (
                    <p className="text-[12px] leading-6 text-[#b42318]">{request.emailError}</p>
                  ) : null}
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="mt-5 h-11 w-full rounded-none text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <Link href="/#planes">Abrir catalogo de membresias</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
