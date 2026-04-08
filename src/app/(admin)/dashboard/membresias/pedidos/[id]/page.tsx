import { notFound } from "next/navigation";
import Link from "next/link";
import { BellRing, QrCode } from "lucide-react";

import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import MembershipCommerceSyncButton from "@/components/admin/MembershipCommerceSyncButton";
import MembershipRequestAnnotationsForm from "@/components/admin/MembershipRequestAnnotationsForm";
import MembershipRequestPaymentForm from "@/components/admin/MembershipRequestPaymentForm";
import MembershipRequestStatusControl from "@/components/admin/MembershipRequestStatusControl";
import { Badge } from "@/components/ui/badge";
import { formatCartAmount } from "@/lib/cart/format";
import { getMembershipOperationalHint } from "@/lib/data/membership-request-dashboard";
import {
  buildMembershipValidationUrl,
  getMembershipRequestById,
  listMembershipPaymentEntries,
  listMembershipRequestAnnotations,
} from "@/lib/data/memberships";
import {
  getMembershipCommerceSyncTone,
  membershipCommerceSyncStatusLabels,
  membershipEmailStatusLabels,
  membershipManualPaymentStatusLabels,
  membershipRequestStatusLabels,
  membershipValidationStatusLabels,
} from "@/lib/memberships";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
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

const hintToneClasses = {
  default: "border-[#d71920]/10 bg-[#fff5f5]",
  muted: "border-black/8 bg-[#f7f5f1]",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
} as const;

export default async function DashboardMembershipRequestDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const request = await getMembershipRequestById(id);

  if (!request) {
    notFound();
  }

  const [annotations, paymentEntries] = await Promise.all([
    listMembershipRequestAnnotations(request.id),
    listMembershipPaymentEntries(request.id),
  ]);
  const hint = getMembershipOperationalHint(request);

  return (
    <div className="space-y-10">
      <DashboardPageHeader
        title={request.requestNumber}
        description="Detalle operativo de la membresia con cobro manual, anotaciones y validacion por QR."
        eyebrow="Membership ops"
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <AdminSection
            title="Resumen del ciclo"
            description="Snapshot comercial de la membresia solicitada, con datos del socio y vigencia operativa."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <AdminSurface inset className="border-black/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Socio vinculado
                </p>
                <p className="mt-3 text-xl font-black uppercase tracking-tight text-[#111111]">
                  {request.member.fullName}
                </p>
                <p className="mt-2 text-[12px] text-[#5f6368]">
                  {request.member.memberNumber} · {request.email}
                </p>
                <p className="mt-1 text-[12px] text-[#5f6368]">
                  Coach: {request.member.trainerName ?? "Sin coach asignado"}
                </p>
              </AdminSurface>
              <AdminSurface inset className="border-black/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Plan y vigencia
                </p>
                <p className="mt-3 text-xl font-black uppercase tracking-tight text-[#111111]">
                  {request.planTitleSnapshot}
                </p>
                <p className="mt-2 text-[12px] text-[#5f6368]">
                  {request.billingLabel ?? `${request.durationDays} dias`}
                </p>
                <p className="mt-1 text-[12px] text-[#5f6368]">
                  {request.cycleStartsOn ?? "Pendiente"} · {request.cycleEndsOn ?? "Pendiente"}
                </p>
              </AdminSurface>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <AdminSurface inset className="border-black/5 p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Total del ciclo
                </p>
                <p className="mt-3 text-xl font-black text-[#111111]">
                  {formatCartAmount(request.priceAmount, request.currencyCode)}
                </p>
              </AdminSurface>
              <AdminSurface inset className="border-black/5 p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Cobrado manual
                </p>
                <p className="mt-3 text-xl font-black text-[#111111]">
                  {formatCartAmount(
                    request.manualPaymentSummary.paidTotal,
                    request.currencyCode,
                  )}
                </p>
              </AdminSurface>
              <AdminSurface inset className="border-black/5 bg-black/[0.04] p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Saldo pendiente
                </p>
                <p className="mt-3 text-xl font-black text-[#111111]">
                  {formatCartAmount(
                    request.manualPaymentSummary.balanceDue,
                    request.currencyCode,
                  )}
                </p>
              </AdminSurface>
            </div>

            {request.notes ? (
              <div className="mt-6 border-l-4 border-black bg-black/5 p-5">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Nota del cliente / operador
                </p>
                <p className="text-sm leading-relaxed text-[#111111]">{request.notes}</p>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection
            title="Anotaciones internas"
            description="Bitacora privada del equipo para acuerdos, excepciones y seguimiento manual."
            badge={
              <Badge variant="muted" className="rounded-none font-bold uppercase tracking-[0.1em]">
                {annotations.length} Registros
              </Badge>
            }
          >
            <div className="space-y-5">
              <MembershipRequestAnnotationsForm
                membershipRequestId={request.id}
                memberId={request.member.id}
              />

              {annotations.length > 0 ? (
                <div className="grid gap-3">
                  {annotations.map((annotation) => (
                    <AdminSurface key={annotation.id} inset className="border-black/5 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                            {annotation.created_by_email ?? "Admin"}
                          </p>
                          <p className="text-sm leading-relaxed text-[#111111]">
                            {annotation.content}
                          </p>
                        </div>
                        <p className="shrink-0 text-[11px] font-medium text-[#5f6368]">
                          {formatDate(annotation.created_at)}
                        </p>
                      </div>
                    </AdminSurface>
                  ))}
                </div>
              ) : (
                <AdminSurface inset className="border border-dashed border-black/10 p-5">
                  <p className="text-sm font-semibold text-[#111111]">
                    Aun no hay anotaciones internas para esta membresia.
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#5f6368]">
                    Usa esta bitacora para registrar acuerdos de cobro, incidencias y renovaciones
                    fuera del alcance del socio.
                  </p>
                </AdminSurface>
              )}
            </div>
          </AdminSection>
        </div>

        <div className="space-y-6">
          <AdminSection
            title="Control operativo"
            description="Estado, cobro manual, QR y seguimiento de recepcion."
          >
            <div className="space-y-8">
              <div className="flex flex-wrap gap-2">
                <Badge variant={request.status === "active" ? "success" : "muted"}>
                  {membershipRequestStatusLabels[request.status]}
                </Badge>
                <Badge
                  variant={
                    request.validation.tone === "success" ? "success" : "warning"
                  }
                >
                  {membershipValidationStatusLabels[request.validation.status]}
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
                <Badge variant={request.emailStatus === "sent" ? "success" : "muted"}>
                  {membershipEmailStatusLabels[request.emailStatus]}
                </Badge>
                <Badge
                  variant={
                    getMembershipCommerceSyncTone(request.commerce.syncStatus) === "success"
                      ? "success"
                      : getMembershipCommerceSyncTone(request.commerce.syncStatus) === "warning"
                        ? "warning"
                        : "muted"
                  }
                >
                  Mirror {membershipCommerceSyncStatusLabels[request.commerce.syncStatus]}
                </Badge>
              </div>

              <div className={cn("border p-5", hintToneClasses[hint.tone])}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Siguiente foco
                </p>
                <p className="mt-3 text-sm font-bold text-[#111111]">{hint.label}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5f6368]">
                  {hint.description}
                </p>
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Bridge commerce
                </p>
                <AdminSurface inset className="space-y-4 border-black/5 p-4">
                  <div className="grid gap-3 text-[12px] text-[#5f6368]">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Estado
                      </p>
                      <p className="mt-1 font-semibold text-[#111111]">
                        {membershipCommerceSyncStatusLabels[request.commerce.syncStatus]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Producto / variante
                      </p>
                      <p className="mt-1 break-all">
                        {request.commerce.productId ?? "Sin producto"} ·{" "}
                        {request.commerce.variantId ?? "Sin variante"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Cart / order
                      </p>
                      <p className="mt-1 break-all">
                        {request.commerce.cartId ?? "Sin cart"} ·{" "}
                        {request.commerce.orderId ?? "Sin order"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                        Ultima sync
                      </p>
                      <p className="mt-1">{formatDate(request.commerce.syncedAt)}</p>
                    </div>
                    {request.commerce.syncError ? (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          Error
                        </p>
                        <p className="mt-1 leading-relaxed text-[#b42318]">
                          {request.commerce.syncError}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {request.commerce.syncStatus !== "ok" ? (
                    <MembershipCommerceSyncButton
                      membershipRequestId={request.id}
                      memberId={request.member.id}
                    />
                  ) : null}
                </AdminSurface>
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Cambiar estado
                </p>
                <MembershipRequestStatusControl
                  membershipRequestId={request.id}
                  memberId={request.member.id}
                  status={request.status}
                />
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Cobro manual
                </p>
                <MembershipRequestPaymentForm
                  membershipRequestId={request.id}
                  memberId={request.member.id}
                  currencyCode={request.currencyCode}
                  balanceDue={request.manualPaymentSummary.balanceDue}
                />
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Historial de cobros
                </p>
                {paymentEntries.length > 0 ? (
                  <div className="grid gap-3">
                    {paymentEntries.map((entry) => (
                      <AdminSurface key={entry.id} inset className="border-black/5 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                              {entry.created_by_email ?? "Admin"}
                            </p>
                            <p className="text-base font-black text-[#111111]">
                              {formatCartAmount(entry.amount, entry.currency_code)}
                            </p>
                            {entry.note ? (
                              <p className="text-[12px] leading-relaxed text-[#5f6368]">
                                {entry.note}
                              </p>
                            ) : null}
                          </div>
                          <p className="text-right text-[11px] text-[#5f6368]">
                            {formatDate(entry.recorded_at)}
                          </p>
                        </div>
                      </AdminSurface>
                    ))}
                  </div>
                ) : (
                  <AdminSurface inset className="border border-dashed border-black/10 p-4">
                    <p className="text-sm font-semibold text-[#111111]">
                      Aun no hay cobros manuales registrados.
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#5f6368]">
                      Usa el bloque superior para dejar el primer abono o cubrir el ciclo por
                      completo.
                    </p>
                  </AdminSurface>
                )}
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Validacion QR
                </p>
                <AdminSurface inset className="border-black/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-black/5 bg-white">
                      <QrCode className="h-4 w-4 text-[#111111]" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[13px] font-bold text-[#111111]">
                        Enlace operativo para recepcion
                      </p>
                      <p className="break-all text-[12px] text-[#5f6368]">
                        {buildMembershipValidationUrl(request.member.membershipQrToken)}
                      </p>
                      <Link
                        href={`/validacion/membresia/${request.member.membershipQrToken}`}
                        target="_blank"
                        className="inline-flex h-10 items-center border border-black/10 bg-white px-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
                      >
                        Abrir validacion
                      </Link>
                    </div>
                  </div>
                </AdminSurface>
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Comunicacion
                </p>
                <AdminSurface inset className="border-black/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-black/5 bg-white text-[#111111]">
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#111111]">
                        Email: {membershipEmailStatusLabels[request.emailStatus]}
                      </p>
                      <p className="text-[12px] text-[#5f6368]">
                        Ultimo envio: {formatDate(request.emailSentAt)}
                      </p>
                    </div>
                  </div>
                </AdminSurface>
              </div>
            </div>
          </AdminSection>
        </div>
      </div>
    </div>
  );
}
