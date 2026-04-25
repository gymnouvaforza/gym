import { notFound } from "next/navigation";
import { BellRing, QrCode } from "lucide-react";

import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import DeleteMembershipRequestButton from "@/components/admin/DeleteMembershipRequestButton";
import MembershipCommerceSyncButton from "@/components/admin/MembershipCommerceSyncButton";
import MembershipRequestEmailButton from "@/components/admin/MembershipRequestEmailButton";
import MembershipActivateQrButton from "@/components/admin/MembershipActivateQrButton";
import MembershipQrPreview from "@/components/admin/MembershipQrPreview";
import MembershipRequestAnnotationsForm from "@/components/admin/MembershipRequestAnnotationsForm";
import MembershipRequestPaymentForm from "@/components/admin/MembershipRequestPaymentForm";
import MembershipRequestStatusControl from "@/components/admin/MembershipRequestStatusControl";
import MembershipRequestDatesForm from "@/components/admin/MembershipRequestDatesForm";
import { Badge } from "@/components/ui/badge";
import { formatCartAmount } from "@/lib/cart/format";
import { getMembershipOperationalHint } from "@/lib/data/membership-request-dashboard";
import {
  buildMembershipValidationUrl,
  getMembershipRequestById,
  listMembershipPaymentEntries,
  listMembershipRequestAnnotations,
} from "@/lib/data/memberships";
import { normalizeMembershipQrToken } from "@/lib/membership-qr";
import {
  getMembershipCommerceSyncTone,
  membershipCommerceSyncStatusLabels,
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

  const publicValidationUrl = normalizeMembershipQrToken(request.member.membershipQrToken)
    ? buildMembershipValidationUrl(request.member.membershipQrToken)
    : null;

  const [annotations, paymentEntries] = await Promise.all([
    listMembershipRequestAnnotations(request.id),
    listMembershipPaymentEntries(request.id),
  ]);
  const hint = getMembershipOperationalHint(request);

  return (
    <div className="space-y-10">
      <DashboardPageHeader
        title={request.requestNumber}
        description="Resumen operativo del socio, cobro manual, QR y seguimiento de la membresía."
        eyebrow="Operaciones de Membresía"
      />

      {/* Bloque Siguiente Acción */}
      <div className={cn("border-2 p-6 shadow-sm rounded-xl", hintToneClasses[hint.tone])}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
              Siguiente foco operativo
            </p>
            <p className="text-lg font-black uppercase tracking-tight text-[#111111]">
              {hint.label}
            </p>
            <p className="text-sm leading-relaxed text-[#5f6368]">
              {hint.description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <Badge variant={request.status === "active" ? "success" : "muted"} className="h-7 px-3 rounded-full uppercase tracking-wider font-bold text-[10px]">
                {membershipRequestStatusLabels[request.status]}
              </Badge>
              <Badge
                variant={request.validation.tone === "success" ? "success" : "warning"}
                className="h-7 px-3 rounded-full uppercase tracking-wider font-bold text-[10px]"
              >
                QR: {membershipValidationStatusLabels[request.validation.status]}
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
                className="h-7 px-3 rounded-full uppercase tracking-wider font-bold text-[10px]"
              >
                PAGO: {membershipManualPaymentStatusLabels[request.manualPaymentSummary.status]}
              </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Resumen para Recepción */}
          <AdminSection
            title="Resumen para recepción"
            description="Informacion esencial para el control de acceso y vigencia del socio."
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
                  Ficha: {request.member.memberNumber}
                </p>
                <p className="mt-1 text-[12px] text-[#5f6368]">
                  Email: {request.email}
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
                  Validez: {request.cycleStartsOn ?? "---"} al {request.cycleEndsOn ?? "---"}
                </p>
              </AdminSurface>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <AdminSurface inset className="border-black/5 p-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Total contrato
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
                <p className="mt-3 text-2xl font-black text-[#111111]">
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
                  Observaciones de la solicitud
                </p>
                <p className="text-sm leading-relaxed text-[#111111]">{request.notes}</p>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection
            title="Comunicación y acceso"
            description="Estado del acceso digital y notificaciones al socio."
          >
            <div className="grid gap-6 md:grid-cols-2">
               {/* QR */}
               <AdminSurface inset className="border-black/5 p-5">
                  {publicValidationUrl ? (
                    <MembershipQrPreview qrUrl={publicValidationUrl} />
                  ) : (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                        Validacion QR
                      </p>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black/5 bg-zinc-50 rounded-lg shadow-sm">
                          <QrCode className="h-6 w-6 text-zinc-300" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <p className="text-[13px] font-bold text-[#111111] leading-tight">
                            Acceso digital pendiente
                          </p>
                          <p className="text-[12px] text-[#d71920] font-bold uppercase italic">
                            QR no generado todavia
                          </p>
                          <MembershipActivateQrButton 
                            membershipRequestId={request.id} 
                            memberId={request.member.id} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
               </AdminSurface>

               {/* Email */}
               <AdminSurface inset className="border-black/5 p-5">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Notificación Email
                  </p>
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center border border-black/5 bg-white rounded-lg shadow-sm",
                        request.emailStatus === "sent"
                          ? "text-emerald-600"
                          : request.emailStatus === "failed"
                            ? "text-red-600"
                            : "text-[#7a7f87]",
                      )}
                    >
                      <BellRing className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 space-y-3 flex-1">
                      <p className="text-[13px] font-bold text-[#111111] leading-tight">
                        {request.emailStatus === "sent"
                          ? "Socio notificado correctamente"
                          : request.emailStatus === "failed"
                            ? "Error en el ultimo envio"
                            : "Notificacion pendiente de envio"}
                      </p>
                      <p className="text-[11px] text-[#5f6368]">
                        {request.emailStatus === "sent"
                          ? `Enviado el ${formatDate(request.emailSentAt)}`
                          : request.emailStatus === "failed"
                            ? `Ultimo intento: ${formatDate(request.emailSentAt)}`
                            : "El socio aun no ha recibido el enlace de acceso."}
                      </p>
                      
                      <MembershipRequestEmailButton
                        membershipRequestId={request.id}
                        memberId={request.member.id}
                        emailStatus={request.emailStatus}
                        size="sm"
                        className="h-10 w-full rounded-none border-black/10 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black/5 transition-all shadow-sm"
                      />
                    </div>
                  </div>
               </AdminSurface>
            </div>
          </AdminSection>

          <AdminSection
            title="Historial de cobros y notas"
            description="Registro de movimientos manuales y anotaciones internas."
          >
            <div className="grid gap-6 lg:grid-cols-2">
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Pagos registrados
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
                    <AdminSurface inset className="border border-dashed border-black/10 p-5 text-center">
                      <p className="text-xs font-bold text-[#7a7f87] uppercase">
                        Sin pagos manuales
                      </p>
                    </AdminSurface>
                  )}
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Bitacora interna
                  </p>
                  <MembershipRequestAnnotationsForm
                    membershipRequestId={request.id}
                    memberId={request.member.id}
                  />

                  {annotations.length > 0 ? (
                    <div className="grid gap-3 mt-4">
                      {annotations.map((annotation) => (
                        <AdminSurface key={annotation.id} inset className="border-black/5 p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                                {annotation.created_by_email ?? "Admin"}
                              </p>
                              <p className="shrink-0 text-[10px] text-[#5f6368]">
                                {formatDate(annotation.created_at)}
                              </p>
                            </div>
                            <p className="text-[13px] leading-relaxed text-[#111111]">
                              {annotation.content}
                            </p>
                          </div>
                        </AdminSurface>
                      ))}
                    </div>
                  ) : null}
               </div>
            </div>
          </AdminSection>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Control de Estado - Prioridad 1 */}
          <AdminSection
            title="Cambiar estado"
            description="Gestiona el ciclo de vida operativo de la membresia."
          >
             <MembershipRequestStatusControl
                membershipRequestId={request.id}
                memberId={request.member.id}
                status={request.status}
              />
          </AdminSection>

          {/* Registro de Cobro - Prioridad 2 */}
          <AdminSection
            title="Registrar cobro"
            description="Añade abonos o ajustes manuales sin depender de Medusa."
          >
            <MembershipRequestPaymentForm
              membershipRequestId={request.id}
              memberId={request.member.id}
              currencyCode={request.currencyCode}
              balanceDue={request.manualPaymentSummary.balanceDue}
            />
          </AdminSection>

          {/* Editar Vigencia - Prioridad 3 */}
          <AdminSection
            title="Editar vigencia"
            description="Ajusta las fechas de inicio y fin del ciclo actual."
          >
            <MembershipRequestDatesForm
              membershipRequestId={request.id}
              memberId={request.member.id}
              defaultValues={{
                cycleStartsOn: request.cycleStartsOn ?? "",
                cycleEndsOn: request.cycleEndsOn ?? "",
              }}
            />
          </AdminSection>

          {/* Detalles Técnicos - Secundarios */}
          <div className="space-y-4 border-t border-black/10 pt-6 opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
              Detalles técnicos
            </p>
            <AdminSurface inset className="space-y-4 border-black/5 p-4 bg-zinc-50/50">
              <div className="grid gap-3 text-[11px] text-[#5f6368]">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                    Sincronización Commerce
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getMembershipCommerceSyncTone(request.commerce.syncStatus) === "success" ? "success" : "muted"} className="h-5 text-[9px]">
                       {membershipCommerceSyncStatusLabels[request.commerce.syncStatus]}
                    </Badge>
                    <span className="text-[10px]">{formatDate(request.commerce.syncedAt)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-black/5 space-y-2">
                   <p className="break-all opacity-70">
                    <span className="font-bold">Prod:</span> {request.commerce.productId ?? "---"}
                  </p>
                  <p className="break-all opacity-70">
                    <span className="font-bold">Variant:</span> {request.commerce.variantId ?? "---"}
                  </p>
                   <p className="break-all opacity-70">
                    <span className="font-bold">Order:</span> {request.commerce.orderId ?? "---"}
                  </p>
                </div>
                {request.commerce.syncError ? (
                  <div className="p-2 bg-red-50 border border-red-100 text-red-700 rounded mt-2">
                    <p className="font-bold uppercase text-[9px] mb-1">Error Sync</p>
                    <p className="leading-tight">{request.commerce.syncError}</p>
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

          {/* Zona Peligrosa */}
          <div className="space-y-4 border-t border-black/10 pt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
              Mantenimiento
            </p>
            <AdminSurface inset className="border-red-100 bg-red-50/50 p-4">
              <p className="text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-2">
                Eliminar solicitud
              </p>
              <DeleteMembershipRequestButton
                membershipRequestId={request.id}
                memberId={request.member.id}
                title="Eliminar solicitud"
                description={`Se eliminara la solicitud ${request.requestNumber} y su historial.`}
                className="h-9 w-full rounded-none text-[9px] font-bold uppercase tracking-[0.1em] border-red-200 text-red-700 hover:bg-red-100"
              />
            </AdminSurface>
          </div>
        </div>
      </div>
    </div>
  );
}
