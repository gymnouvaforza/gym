import Image from "next/image";
import { notFound } from "next/navigation";
import { BellRing, CircleDollarSign, PackageOpen } from "lucide-react";

import AdminSection from "@/components/admin/AdminSection";
import PickupRequestAnnotationsForm from "@/components/admin/PickupRequestAnnotationsForm";
import PickupRequestPaymentForm from "@/components/admin/PickupRequestPaymentForm";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import PickupRequestStatusControl from "@/components/admin/PickupRequestStatusControl";
import PickupRequestTimeline from "@/components/admin/PickupRequestTimeline";
import ResendPickupRequestEmailButton from "@/components/admin/ResendPickupRequestEmailButton";
import SyncPickupRequestFromOrderButton from "@/components/admin/SyncPickupRequestFromOrderButton";
import { Badge } from "@/components/ui/badge";
import { formatCartAmount } from "@/lib/cart/format";
import {
  applyManualPaymentSummaryToPickupRequest,
  getEffectivePickupRequestPaymentLabel,
} from "@/lib/cart/pickup-request-payment";
import {
  getPickupRequestEmailTone,
  getPickupRequestPaymentTone,
  getPickupRequestStatusTone,
  pickupRequestEmailStatusLabels,
  pickupRequestPaymentStatusLabels,
  pickupRequestStatusLabels,
} from "@/lib/cart/pickup-request";
import { getPickupRequestOperationalHint } from "@/lib/data/pickup-request-dashboard";
import {
  getPickupRequestById,
  getPickupRequestManualPaymentSummary,
  listPickupRequestAnnotations,
  listPickupRequestPaymentEntries,
} from "@/lib/data/pickup-requests";
import { cn } from "@/lib/utils";
import type { PickupRequestDetail } from "@/lib/cart/types";

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

const manualPaymentStatusLabels = {
  pending: "Sin abonos",
  partial: "Pago parcial",
  paid: "Pagado",
  overpaid: "Con excedente",
} as const;

const manualPaymentStatusToneClasses = {
  pending: "border-black/10 bg-black/[0.04] text-[#5f6368]",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  overpaid: "border-sky-200 bg-sky-50 text-sky-700",
} as const;

export default async function DashboardStorePickupRequestDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const pickupRequest = await getPickupRequestById(id);

  if (!pickupRequest) {
    notFound();
  }

  const [annotations, manualPaymentSummary, paymentEntries] = await Promise.all([
    listPickupRequestAnnotations(pickupRequest.id),
    getPickupRequestManualPaymentSummary(pickupRequest.id),
    listPickupRequestPaymentEntries(pickupRequest.id),
  ]);
  const paymentAwarePickupRequest: PickupRequestDetail = applyManualPaymentSummaryToPickupRequest(
    pickupRequest,
    manualPaymentSummary,
  );
  const hint = getPickupRequestOperationalHint(paymentAwarePickupRequest);

  return (
    <div className="space-y-10">
      <DashboardPageHeader
        title={pickupRequest.requestNumber}
        description="Detalle congelado del pedido pickup, con lineas, timeline operativo, pago y control de comunicacion."
        eyebrow="Pedidos pickup"
      />

      <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <AdminSection
            title="Lineas del pedido"
            description="Snapshot del pedido pickup tal y como quedo registrado para la operacion."
            badge={
              <Badge variant="muted" className="rounded-none font-bold uppercase tracking-[0.1em]">
                {pickupRequest.itemCount} Articulos
              </Badge>
            }
          >
            <div className="grid gap-1">
              {pickupRequest.lineItems.map((lineItem) => (
                <AdminSurface
                  key={lineItem.id}
                  inset
                  className="overflow-hidden border-black/5 p-0"
                >
                  <div className="flex items-stretch">
                    <div className="relative w-24 shrink-0 border-r border-black/5 bg-black/5">
                      {lineItem.thumbnail ? (
                        <Image
                          src={lineItem.thumbnail}
                          alt={lineItem.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PackageOpen className="h-6 w-6 text-black/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                      <div className="space-y-1.5">
                        <p className="leading-tight tracking-tight text-[15px] font-black uppercase text-[#111111]">
                          {lineItem.title}
                        </p>
                        {lineItem.selectedOptions.length > 0 ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {lineItem.selectedOptions.map((option, index) => (
                              <span
                                key={index}
                                className="border border-black/5 bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#5f6368]"
                              >
                                {option.optionTitle
                                  ? `${option.optionTitle}: ${option.value}`
                                  : option.value}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {lineItem.variantSku ? (
                          <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                            SKU {lineItem.variantSku}
                          </p>
                        ) : null}
                      </div>
                      <div className="min-w-[140px] border-l border-black/5 pl-6 text-right">
                        <p className="font-display text-2xl font-black italic tracking-tighter text-[#d71920]">
                          {lineItem.total > 0
                            ? formatCartAmount(lineItem.total, pickupRequest.currencyCode)
                            : "S/ 0.00"}
                        </p>
                        <div className="mt-1 flex flex-col items-end gap-1">
                          <span className="bg-black/5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#111111]">
                            QTY: {lineItem.quantity}
                          </span>
                          <span className="text-[11px] font-bold text-[#7a7f87]">
                            UNIT: {formatCartAmount(lineItem.unitPrice, pickupRequest.currencyCode)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AdminSurface>
              ))}
            </div>

            <div className="mt-8 grid gap-1 sm:grid-cols-3">
              <AdminSurface inset className="border-black/5 p-5 text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                  Total del pedido
                </p>
                <p className="text-xl font-bold text-[#111111]">
                  {formatCartAmount(pickupRequest.total, pickupRequest.currencyCode)}
                </p>
              </AdminSurface>
              <AdminSurface inset className="border-black/5 p-5 text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                  Cobrado manual
                </p>
                <p className="text-xl font-bold text-[#111111]">
                  {formatCartAmount(
                    manualPaymentSummary.paidTotal,
                    pickupRequest.currencyCode,
                  )}
                </p>
              </AdminSurface>
              <AdminSurface inset className="border-black/5 bg-black/5 p-5 text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                  Saldo pendiente
                </p>
                <p className="font-display text-2xl font-black italic text-[#111111]">
                  {formatCartAmount(
                    manualPaymentSummary.balanceDue,
                    pickupRequest.currencyCode,
                  )}
                </p>
              </AdminSurface>
            </div>
          </AdminSection>

          <AdminSection
            title="Trazabilidad y Resumen"
            description="Metadatos tecnicos y registro de la transaccion."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                    Cliente y origen
                  </p>
                  <p className="text-sm font-bold text-[#111111]">{pickupRequest.email}</p>
                  <p className="text-[13px] text-[#5f6368]">
                    {pickupRequest.customerId ? `Socio: ${pickupRequest.customerId}` : "Invitado"}
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    {pickupRequest.supabaseUserId
                      ? `User: ${pickupRequest.supabaseUserId}`
                      : "Sin cuenta Supabase"}
                  </p>
                  <p className="text-[13px] text-[#5f6368]">Source: {pickupRequest.source}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                    Identificadores
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    Order ID:{" "}
                    <span className="font-mono font-medium text-black">
                      {pickupRequest.orderId ?? "Pendiente"}
                    </span>
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    Cart ID:{" "}
                    <span className="font-mono font-medium text-black">
                      {pickupRequest.cartId}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                    Pago y referencias
                  </p>
                  <p className="text-sm font-bold text-[#111111]">
                    {pickupRequest.paymentProvider ?? "Manual"}
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    PayPal Order: {pickupRequest.paypalOrderId ?? "N/A"}
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    PayPal Capture: {pickupRequest.paypalCaptureId ?? "N/A"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
                    Fechas y logs
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    Creado: {formatDate(pickupRequest.createdAt)}
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    Cobrado:{" "}
                    {formatDate(
                      paymentAwarePickupRequest.paymentCapturedAt ??
                        paymentAwarePickupRequest.paymentAuthorizedAt,
                    )}
                  </p>
                  <p className="text-[13px] text-[#5f6368]">
                    Actualizado: {formatDate(pickupRequest.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {pickupRequest.notes ? (
              <div className="mt-8 border-l-4 border-black bg-black/5 p-5">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Notas del cliente
                </p>
                <p className="text-sm italic leading-relaxed text-[#111111]">
                  &quot;{pickupRequest.notes}&quot;
                </p>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection
            title="Anotaciones internas"
            description="Bitacora privada del equipo para seguimiento operativo, acuerdos y contexto manual."
            badge={
              <Badge variant="muted" className="rounded-none font-bold uppercase tracking-[0.1em]">
                {annotations.length} Registros
              </Badge>
            }
          >
            <div className="space-y-5">
              <PickupRequestAnnotationsForm pickupRequestId={pickupRequest.id} />

              {annotations.length > 0 ? (
                <div className="grid gap-3">
                  {annotations.map((annotation) => (
                    <AdminSurface key={annotation.id} inset className="border-black/5 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                            {annotation.createdByEmail ?? "Admin"}
                          </p>
                          <p className="text-sm leading-relaxed text-[#111111]">
                            {annotation.content}
                          </p>
                        </div>
                        <p className="shrink-0 text-[11px] font-medium text-[#5f6368]">
                          {formatDate(annotation.createdAt)}
                        </p>
                      </div>
                    </AdminSurface>
                  ))}
                </div>
              ) : (
                <AdminSurface inset className="border border-dashed border-black/10 p-5">
                  <p className="text-sm font-semibold text-[#111111]">
                    Aun no hay anotaciones internas para este pedido.
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#5f6368]">
                    La nota del cliente se mantiene aparte. Usa esta bitacora para registrar
                    seguimiento interno sin perder historial.
                  </p>
                </AdminSurface>
              )}
            </div>
          </AdminSection>
        </div>

        <div className="space-y-6">
          <AdminSection
            title="Control Operativo"
            description="Gestion de estado y notificaciones."
          >
            <div className="space-y-8">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={getPickupRequestStatusTone(pickupRequest.status)}
                  className="rounded-none px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em]"
                >
                  {pickupRequestStatusLabels[pickupRequest.status]}
                </Badge>
                <Badge
                  variant={getPickupRequestEmailTone(pickupRequest.emailStatus)}
                  className="rounded-none border-0 bg-black/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-black/60"
                >
                  {pickupRequestEmailStatusLabels[pickupRequest.emailStatus]}
                </Badge>
                <Badge
                  variant={getPickupRequestPaymentTone(paymentAwarePickupRequest.paymentStatus)}
                  className="rounded-none border-0 bg-black/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-black/60"
                >
                  Pago:{" "}
                  {getEffectivePickupRequestPaymentLabel({
                    paymentStatus: pickupRequest.paymentStatus,
                    manualPaymentStatus: manualPaymentSummary.status,
                    defaultLabel:
                      pickupRequestPaymentStatusLabels[pickupRequest.paymentStatus],
                  })}
                </Badge>
                <Badge
                  className={cn(
                    "rounded-none border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em]",
                    manualPaymentStatusToneClasses[manualPaymentSummary.status],
                  )}
                >
                  Manual: {manualPaymentStatusLabels[manualPaymentSummary.status]}
                </Badge>
              </div>

              <div className="grid gap-1 sm:grid-cols-2">
                <AdminSurface inset className="border-black/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Cobrado manual
                  </p>
                  <p className="mt-2 text-lg font-black text-[#111111]">
                    {formatCartAmount(
                      manualPaymentSummary.paidTotal,
                      pickupRequest.currencyCode,
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6368]">
                    {manualPaymentSummary.entryCount} movimiento
                    {manualPaymentSummary.entryCount === 1 ? "" : "s"}
                  </p>
                </AdminSurface>
                <AdminSurface inset className="border-black/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                    Saldo pendiente
                  </p>
                  <p className="mt-2 text-lg font-black text-[#111111]">
                    {formatCartAmount(
                      manualPaymentSummary.balanceDue,
                      pickupRequest.currencyCode,
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-[#5f6368]">
                    {manualPaymentSummary.updatedAt
                      ? `Ultimo abono: ${formatDate(manualPaymentSummary.updatedAt)}`
                      : "Sin cobros registrados todavia"}
                  </p>
                </AdminSurface>
              </div>

              <div className={cn("relative overflow-hidden border p-5", hintToneClasses[hint.tone])}>
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    hintToneClasses[hint.tone]
                      .split(" ")[1]
                      .replace("text-", "bg-")
                      .replace("bg-", "bg-"),
                  )}
                />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Siguiente foco
                </p>
                <p className="mt-3 text-sm font-bold leading-tight text-[#111111]">
                  {hint.label}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5f6368]">
                  {hint.description}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Timeline
                </p>
                <PickupRequestTimeline pickupRequest={paymentAwarePickupRequest} />
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Cobro manual
                </p>
                <PickupRequestPaymentForm
                  pickupRequestId={pickupRequest.id}
                  currencyCode={pickupRequest.currencyCode}
                  balanceDue={manualPaymentSummary.balanceDue}
                />
                <AdminSurface inset className="border-black/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-black/5 bg-white text-[#111111]">
                      <CircleDollarSign className="h-4 w-4" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[13px] font-bold text-[#111111]">
                        Los cobros se registran de forma manual y aditiva.
                      </p>
                      <p className="text-[12px] leading-relaxed text-[#5f6368]">
                        Cada abono crea un movimiento nuevo. Puedes cobrar en partes o cubrir el
                        saldo completo, y la ficha recalcula automaticamente el pendiente.
                      </p>
                    </div>
                  </div>
                </AdminSurface>
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
                              {entry.createdByEmail ?? "Admin"}
                            </p>
                            <p className="text-base font-black text-[#111111]">
                              {formatCartAmount(entry.amount, entry.currencyCode)}
                            </p>
                            {entry.note ? (
                              <p className="text-[12px] leading-relaxed text-[#5f6368]">
                                {entry.note}
                              </p>
                            ) : null}
                          </div>
                          <p className="shrink-0 text-right text-[11px] text-[#5f6368]">
                            {formatDate(entry.recordedAt)}
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
                      Usa el bloque superior para dejar el primer abono o marcar el pedido como
                      pagado al completo.
                    </p>
                  </AdminSurface>
                )}
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Cambiar estado
                </p>
                <PickupRequestStatusControl
                  pickupRequestId={pickupRequest.id}
                  status={pickupRequest.status}
                />
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Comunicacion
                </p>
                <AdminSurface inset className="border-black/5 p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center border border-black/5 bg-white shadow-sm",
                        pickupRequest.emailStatus === "sent"
                          ? "text-emerald-600"
                          : pickupRequest.emailStatus === "failed"
                            ? "text-red-600"
                            : "text-[#7a7f87]",
                      )}
                    >
                      <BellRing className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#111111]">
                        {pickupRequest.emailStatus === "sent"
                          ? "Cliente notificado"
                          : pickupRequest.emailStatus === "failed"
                            ? "Error de envio"
                            : "Sin notificar"}
                      </p>
                      <p className="truncate text-[11px] text-[#5f6368]">
                        {pickupRequest.emailSentAt
                          ? `Enviado el ${formatDate(pickupRequest.emailSentAt)}`
                          : "Notificacion pendiente"}
                      </p>
                    </div>
                  </div>
                  <ResendPickupRequestEmailButton
                    pickupRequestId={pickupRequest.id}
                    emailStatus={pickupRequest.emailStatus}
                    size="sm"
                    className="h-11 w-full rounded-none text-[10px] font-bold uppercase tracking-[0.1em]"
                  />
                </AdminSurface>
              </div>

              <div className="space-y-4 border-t border-black/10 pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Snapshot Medusa
                </p>
                <AdminSurface inset className="border-black/5 p-4">
                  <p className="mb-4 text-[11px] leading-relaxed text-[#5f6368]">
                    {pickupRequest.orderId
                      ? "Actualiza los datos locales con la ultima informacion de Medusa (precios, lineas y estado de pago)."
                      : "Sincronizacion deshabilitada: no hay Order vinculada en Medusa."}
                  </p>
                  <SyncPickupRequestFromOrderButton
                    pickupRequestId={pickupRequest.id}
                    cartId={pickupRequest.cartId}
                    orderId={pickupRequest.orderId}
                    size="sm"
                    className="h-11 w-full rounded-none text-[10px] font-bold uppercase tracking-[0.1em]"
                  />
                </AdminSurface>
              </div>
            </div>
          </AdminSection>
        </div>
      </div>
    </div>
  );
}
