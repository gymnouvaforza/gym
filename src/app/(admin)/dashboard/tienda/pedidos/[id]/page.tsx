import { notFound } from "next/navigation";

import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import PickupRequestStatusControl from "@/components/admin/PickupRequestStatusControl";
import PickupRequestTimeline from "@/components/admin/PickupRequestTimeline";
import ResendPickupRequestEmailButton from "@/components/admin/ResendPickupRequestEmailButton";
import SyncPickupRequestFromOrderButton from "@/components/admin/SyncPickupRequestFromOrderButton";
import { Badge } from "@/components/ui/badge";
import { formatCartAmount } from "@/lib/cart/format";
import {
  getPickupRequestEmailTone,
  getPickupRequestPaymentTone,
  getPickupRequestStatusTone,
  pickupRequestEmailStatusLabels,
  pickupRequestPaymentStatusLabels,
  pickupRequestStatusLabels,
} from "@/lib/cart/pickup-request";
import { getPickupRequestOperationalHint } from "@/lib/data/pickup-request-dashboard";
import { getPickupRequestById } from "@/lib/data/pickup-requests";
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

  const hint = getPickupRequestOperationalHint(pickupRequest);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={pickupRequest.requestNumber}
        description="Detalle congelado del pedido pickup, con lineas, timeline operativo, pago y control de comunicacion."
        eyebrow="Pedidos pickup"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-4">
          <AdminSection
            title="Lineas"
            description="Snapshot del pedido pagado para recogida, tal y como quedo proyectado."
          >
            <div className="space-y-3">
              {pickupRequest.lineItems.map((lineItem) => (
                <AdminSurface key={lineItem.id} inset className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{lineItem.title}</p>
                      {lineItem.selectedOptions.length > 0 ? (
                        <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                          {lineItem.selectedOptions
                            .map((option) =>
                              option.optionTitle
                                ? `${option.optionTitle}: ${option.value}`
                                : option.value,
                            )
                            .join(" | ")}
                        </p>
                      ) : null}
                      {lineItem.variantSku ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7a7f87]">
                          SKU {lineItem.variantSku}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#111111]">
                        {formatCartAmount(lineItem.total, pickupRequest.currencyCode)}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#5f6368]">
                        {lineItem.quantity} x{" "}
                        {formatCartAmount(lineItem.unitPrice, pickupRequest.currencyCode)}
                      </p>
                    </div>
                  </div>
                </AdminSurface>
              ))}
            </div>
          </AdminSection>
        </div>

        <div className="space-y-4">
          <AdminSection
            title="Estado y acciones"
            description="Lectura rapida del pedido y controles operativos para el equipo."
          >
            <AdminSurface inset className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getPickupRequestStatusTone(pickupRequest.status)}>
                  {pickupRequestStatusLabels[pickupRequest.status]}
                </Badge>
                <Badge variant={getPickupRequestEmailTone(pickupRequest.emailStatus)}>
                  {pickupRequestEmailStatusLabels[pickupRequest.emailStatus]}
                </Badge>
                <Badge variant={getPickupRequestPaymentTone(pickupRequest.paymentStatus)}>
                  {pickupRequestPaymentStatusLabels[pickupRequest.paymentStatus]}
                </Badge>
              </div>

              <div className={cn("rounded-none border p-4", hintToneClasses[hint.tone])}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                  Siguiente foco
                </p>
                <p className="mt-2 text-sm font-semibold text-[#111111]">{hint.label}</p>
                <p className="mt-2 text-sm leading-6 text-[#5f6368]">{hint.description}</p>
              </div>

              <PickupRequestTimeline pickupRequest={pickupRequest} />

              <div className="space-y-3 border-t border-black/8 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                  Cambiar estado
                </p>
                <PickupRequestStatusControl
                  pickupRequestId={pickupRequest.id}
                  status={pickupRequest.status}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-none border border-black/8 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                    Email al cliente
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                    {pickupRequest.emailStatus === "failed" && pickupRequest.emailError
                      ? pickupRequest.emailError
                      : pickupRequest.emailSentAt
                        ? `Ultimo envio: ${formatDate(pickupRequest.emailSentAt)}`
                        : "Aun no hay confirmacion de envio registrada."}
                  </p>
                  <ResendPickupRequestEmailButton
                    pickupRequestId={pickupRequest.id}
                    emailStatus={pickupRequest.emailStatus}
                    size="sm"
                    className="mt-4 tracking-normal"
                    title="Reenviar o reintentar la notificacion del pedido pickup."
                  />
                </div>

                <div className="rounded-none border border-black/8 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                    Snapshot Medusa
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                    {pickupRequest.orderId
                      ? "Relee la orden de Medusa y vuelve a congelar lineas, totales y trazabilidad."
                      : "Todavia no hay order vinculada en Medusa, asi que no puedes relanzar la sincronizacion."}
                  </p>
                  <SyncPickupRequestFromOrderButton
                    pickupRequestId={pickupRequest.id}
                    cartId={pickupRequest.cartId}
                    orderId={pickupRequest.orderId}
                    size="sm"
                    className="mt-4 tracking-normal"
                    title="Refrescar el snapshot local con la orden de Medusa."
                  />
                </div>
              </div>
            </AdminSurface>
          </AdminSection>

          <AdminSection
            title="Resumen"
            description="Totales, pago, notas y trazabilidad del pedido."
          >
            <AdminSurface inset className="space-y-4 p-5">
              <div className="flex items-center justify-between text-sm text-[#5f6368]">
                <span>Articulos</span>
                <span>{pickupRequest.itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[#5f6368]">
                <span>Subtotal</span>
                <span>{formatCartAmount(pickupRequest.subtotal, pickupRequest.currencyCode)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/8 pt-3 text-sm font-semibold text-[#111111]">
                <span>Total</span>
                <span>{formatCartAmount(pickupRequest.total, pickupRequest.currencyCode)}</span>
              </div>
              {pickupRequest.chargedCurrencyCode && pickupRequest.chargedTotal !== null ? (
                <div className="flex items-center justify-between text-sm text-[#5f6368]">
                  <span>Cargo PayPal</span>
                  <span>
                    {formatCartAmount(
                      pickupRequest.chargedTotal,
                      pickupRequest.chargedCurrencyCode,
                    )}
                  </span>
                </div>
              ) : null}
              {pickupRequest.exchangeRate ? (
                <div className="text-sm leading-6 text-[#5f6368]">
                  Tipo de cambio:{" "}
                  <strong className="text-[#111111]">
                    S/ {pickupRequest.exchangeRate.toFixed(3)} por USD
                  </strong>
                  .
                  {pickupRequest.exchangeRateSource
                    ? ` Fuente: ${pickupRequest.exchangeRateSource}.`
                    : ""}
                  {pickupRequest.exchangeRateReference
                    ? ` Referencia: ${pickupRequest.exchangeRateReference}.`
                    : ""}
                </div>
              ) : null}

              <div className="border-t border-black/8 pt-4 text-sm leading-6 text-[#5f6368]">
                <p>
                  <strong className="text-[#111111]">Email:</strong> {pickupRequest.email}
                </p>
                <p>
                  <strong className="text-[#111111]">Origen:</strong> {pickupRequest.source}
                </p>
                <p>
                  <strong className="text-[#111111]">Order:</strong>{" "}
                  {pickupRequest.orderId ?? "Pendiente de completar"}
                </p>
                <p>
                  <strong className="text-[#111111]">Proveedor de pago:</strong>{" "}
                  {pickupRequest.paymentProvider ?? "paypal"}
                </p>
                <p>
                  <strong className="text-[#111111]">PayPal order:</strong>{" "}
                  {pickupRequest.paypalOrderId ?? "Sin registro"}
                </p>
                <p>
                  <strong className="text-[#111111]">PayPal capture:</strong>{" "}
                  {pickupRequest.paypalCaptureId ?? "Sin registro"}
                </p>
                <p>
                  <strong className="text-[#111111]">Cart:</strong> {pickupRequest.cartId}
                </p>
                <p>
                  <strong className="text-[#111111]">Customer:</strong>{" "}
                  {pickupRequest.customerId ?? "Invitado"}
                </p>
                <p>
                  <strong className="text-[#111111]">Supabase user:</strong>{" "}
                  {pickupRequest.supabaseUserId ?? "No vinculado"}
                </p>
                <p>
                  <strong className="text-[#111111]">Creado:</strong>{" "}
                  {formatDate(pickupRequest.createdAt)}
                </p>
                <p>
                  <strong className="text-[#111111]">Pago autorizado:</strong>{" "}
                  {formatDate(pickupRequest.paymentAuthorizedAt)}
                </p>
                <p>
                  <strong className="text-[#111111]">Pago capturado:</strong>{" "}
                  {formatDate(pickupRequest.paymentCapturedAt)}
                </p>
                <p>
                  <strong className="text-[#111111]">Ultima actualizacion:</strong>{" "}
                  {formatDate(pickupRequest.updatedAt)}
                </p>
                <p>
                  <strong className="text-[#111111]">Ultimo email:</strong>{" "}
                  {formatDate(pickupRequest.emailSentAt)}
                </p>
              </div>

              {pickupRequest.notes ? (
                <div className="border border-black/8 bg-white p-4 text-sm leading-6 text-[#5f6368]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                    Nota de recogida
                  </p>
                  <p className="mt-2">{pickupRequest.notes}</p>
                </div>
              ) : null}

              {pickupRequest.emailError ? (
                <div className="border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  <p className="font-semibold">Ultimo error de email</p>
                  <p className="mt-2">{pickupRequest.emailError}</p>
                </div>
              ) : null}
            </AdminSurface>
          </AdminSection>
        </div>
      </div>
    </div>
  );
}
