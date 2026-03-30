import { AlertTriangle, BellRing, ClipboardList, PackageCheck, PackageOpen } from "lucide-react";
import Link from "next/link";

import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import PickupRequestTimeline from "@/components/admin/PickupRequestTimeline";
import PickupRequestsToolbar from "@/components/admin/PickupRequestsToolbar";
import ResendPickupRequestEmailButton from "@/components/admin/ResendPickupRequestEmailButton";
import SyncPickupRequestFromOrderButton from "@/components/admin/SyncPickupRequestFromOrderButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCartAmount } from "@/lib/cart/format";
import {
  getPickupRequestEmailTone,
  getPickupRequestPaymentTone,
  getPickupRequestStatusTone,
  pickupRequestEmailStatusLabels,
  pickupRequestPaymentStatusLabels,
  pickupRequestStatusLabels,
} from "@/lib/cart/pickup-request";
import {
  filterAndSortPickupRequests,
  getPickupRequestOperationalHint,
  hasActivePickupRequestFilters,
  parsePickupRequestFilters,
  summarizePickupRequests,
} from "@/lib/data/pickup-request-dashboard";
import {
  getPickupRequestsSnapshot,
  reconcileRecentPickupRequestsSnapshot,
} from "@/lib/data/pickup-requests";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
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

export default async function DashboardStorePickupRequestsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const params = await searchParams;
  const filters = parsePickupRequestFilters(params);

  const reconcileSummary = await reconcileRecentPickupRequestsSnapshot({
    hours: 24,
    limit: 25,
  });
  const snapshot = await getPickupRequestsSnapshot({
    status: filters.status === "all" ? null : filters.status,
    limit: 100,
    offset: 0,
  });

  const filteredPickupRequests = filterAndSortPickupRequests(snapshot.pickupRequests, filters);
  const summary = summarizePickupRequests(filteredPickupRequests);
  const hasActiveFilters = hasActivePickupRequestFilters(filters);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Pedidos pickup"
        description="Solicitudes enviadas desde la tienda para recogida local, con lectura operativa del estado, el pago y la comunicacion."
        eyebrow="Tienda"
      />

      {snapshot.warning ? <DashboardNotice message={snapshot.warning} /> : null}
      {reconcileSummary.warning ? <DashboardNotice message={reconcileSummary.warning} /> : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AdminMetricCard
          label="En curso"
          value={String(summary.inProgress)}
          hint="Pedidos todavia en confirmacion o preparacion interna."
          icon={ClipboardList}
          tone={summary.inProgress ? "default" : "muted"}
        />
        <AdminMetricCard
          label="Listos"
          value={String(summary.readyNow)}
          hint="Pedidos que ya pueden entregarse en el club."
          icon={PackageCheck}
          tone={summary.readyNow ? "success" : "muted"}
        />
        <AdminMetricCard
          label="Con incidencia"
          value={String(summary.actionRequired)}
          hint="Pago, email o cancelacion con necesidad de accion manual."
          icon={AlertTriangle}
          tone={summary.actionRequired ? "warning" : "muted"}
        />
        <AdminMetricCard
          label="Entregados"
          value={String(summary.fulfilled)}
          hint="Pedidos pickup ya cerrados y entregados."
          icon={PackageOpen}
          tone="muted"
        />
      </div>

      <AdminSection
        title="Bandeja operativa"
        description="Vista pensada para decidir rapido que pedido hay que confirmar, preparar, revisar o cerrar."
      >
        <div className="space-y-4">
          <PickupRequestsToolbar
            key={`${filters.q}|${filters.status}|${filters.paymentStatus}|${filters.emailStatus}|${filters.attention}|${filters.sort}`}
            filters={filters}
          />

          {filteredPickupRequests.length === 0 ? (
            <AdminSurface inset className="p-5">
              <p className="text-sm font-semibold text-[#111111]">
                {hasActiveFilters
                  ? "No hay pedidos pickup que encajen con esos filtros."
                  : "Todavia no hay pedidos pickup enviados."}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                {hasActiveFilters
                  ? "Prueba a limpiar filtros o relajar la cola operativa para recuperar contexto."
                  : "Cuando alguien cierre el carrito desde la tienda, veras aqui su referencia, timeline, pago y comunicacion."}
              </p>
            </AdminSurface>
          ) : (
            <div className="space-y-4">
              {filteredPickupRequests.map((pickupRequest) => {
                const hint = getPickupRequestOperationalHint(pickupRequest);

                return (
                  <AdminSurface key={pickupRequest.id} inset className="p-4 sm:p-5">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.75fr)]">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-3 border-b border-black/8 pb-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-[#111111]">
                                {pickupRequest.requestNumber}
                              </p>
                              <Badge variant={getPickupRequestStatusTone(pickupRequest.status)}>
                                {pickupRequestStatusLabels[pickupRequest.status]}
                              </Badge>
                              <Badge variant={getPickupRequestEmailTone(pickupRequest.emailStatus)}>
                                {pickupRequestEmailStatusLabels[pickupRequest.emailStatus]}
                              </Badge>
                              <Badge
                                variant={getPickupRequestPaymentTone(pickupRequest.paymentStatus)}
                              >
                                {pickupRequestPaymentStatusLabels[pickupRequest.paymentStatus]}
                              </Badge>
                            </div>
                            <p className="text-xs uppercase tracking-[0.16em] text-[#7a7f87]">
                              Alta {formatDate(pickupRequest.createdAt)} · Ultimo cambio{" "}
                              {formatDate(pickupRequest.updatedAt)}
                            </p>
                            <div className="space-y-1 text-sm leading-6 text-[#5f6368]">
                              <p>{pickupRequest.email}</p>
                              <p>
                                {pickupRequest.customerId ? "Socio vinculado" : "Invitado"} ·{" "}
                                {pickupRequest.itemCount} articulo(s) ·{" "}
                                {formatCartAmount(pickupRequest.total, pickupRequest.currencyCode)}
                              </p>
                              <p>
                                Order: {pickupRequest.orderId ?? "Pendiente"} · Cart:{" "}
                                {pickupRequest.cartId}
                              </p>
                              <p>
                                Pago: {pickupRequest.paymentProvider ?? "paypal"}
                                {pickupRequest.paymentCapturedAt
                                  ? ` · Cobrado ${formatDate(pickupRequest.paymentCapturedAt)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        <PickupRequestTimeline pickupRequest={pickupRequest} compact />
                      </div>

                      <div className="space-y-4 border-t border-black/8 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                        <div
                          className={cn(
                            "rounded-none border p-4",
                            hintToneClasses[hint.tone],
                          )}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                            Siguiente foco
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#111111]">
                            {hint.label}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                            {hint.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                            Acciones rapidas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <ResendPickupRequestEmailButton
                              pickupRequestId={pickupRequest.id}
                              emailStatus={pickupRequest.emailStatus}
                              size="sm"
                              className="tracking-normal"
                              title="Reenviar o reintentar el email operativo de este pedido."
                            />
                            <SyncPickupRequestFromOrderButton
                              pickupRequestId={pickupRequest.id}
                              cartId={pickupRequest.cartId}
                              orderId={pickupRequest.orderId}
                              size="sm"
                              className="tracking-normal"
                              title="Volver a leer la orden en Medusa y refrescar el snapshot local."
                            />
                            <Button
                              asChild
                              variant="secondary"
                              size="sm"
                              className="tracking-normal"
                            >
                              <Link href={`/dashboard/tienda/pedidos/${pickupRequest.id}`}>
                                Ver detalle
                              </Link>
                            </Button>
                          </div>
                        </div>

                        <div className="rounded-none border border-black/8 bg-white p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7a7f87]">
                            Comunicacion
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                            {pickupRequest.emailStatus === "failed" && pickupRequest.emailError
                              ? pickupRequest.emailError
                              : pickupRequest.emailSentAt
                                ? `Ultimo envio registrado: ${formatDate(pickupRequest.emailSentAt)}`
                                : "Sin confirmacion de envio todavia."}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-[#7a7f87]">
                            <BellRing className="h-3.5 w-3.5" />
                            {pickupRequest.emailStatus === "sent"
                              ? "Cliente avisado"
                              : pickupRequest.emailStatus === "failed"
                                ? "Pendiente de reintento"
                                : "Pendiente de notificar"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AdminSurface>
                );
              })}
            </div>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
