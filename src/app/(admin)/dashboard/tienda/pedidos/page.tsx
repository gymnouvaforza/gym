import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Clock3,
  Mail,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  UserRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSection from "@/components/admin/AdminSection";
import AdminSurface from "@/components/admin/AdminSurface";
import DashboardEmptyState from "@/components/admin/DashboardEmptyState";
import DashboardNotice from "@/components/admin/DashboardNotice";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import DeletePickupRequestButton from "@/components/admin/DeletePickupRequestButton";
import DraggableHorizontalScroll from "@/components/admin/DraggableHorizontalScroll";
import PickupRequestsToolbar from "@/components/admin/PickupRequestsToolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function compactDate(value: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

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
        description="Lista compacta para escaneo rapido. El trabajo detallado del pedido vive dentro de su ficha."
      >
        <div className="space-y-4">
          <PickupRequestsToolbar
            key={`${filters.q}|${filters.status}|${filters.paymentStatus}|${filters.emailStatus}|${filters.attention}|${filters.dateFrom}|${filters.dateTo}|${filters.sort}`}
            filters={filters}
          />

          {filteredPickupRequests.length === 0 ? (
            <DashboardEmptyState
              title={
                hasActiveFilters
                  ? "No hay pedidos pickup que encajen con esos filtros."
                  : "Todavia no hay pedidos pickup enviados."
              }
              description={
                hasActiveFilters
                  ? "Prueba a limpiar filtros o relajar la cola operativa para recuperar contexto."
                  : "Cuando alguien cierre el carrito desde la tienda, veras aqui una fila resumida con acceso al detalle."
              }
            />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredPickupRequests.map((pickupRequest) => {
                  const hint = getPickupRequestOperationalHint(pickupRequest);

                  return (
                    <AdminSurface key={pickupRequest.id} inset className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/6 bg-[#111111] text-white">
                              <ReceiptText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#111111]">
                                {pickupRequest.requestNumber}
                              </p>
                              <p className="text-[11px] text-[#7a7f87]">
                                {compactDate(pickupRequest.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-[#111111]">
                          {formatCartAmount(pickupRequest.total, pickupRequest.currencyCode)}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant={getPickupRequestStatusTone(pickupRequest.status)}>
                          {pickupRequestStatusLabels[pickupRequest.status]}
                        </Badge>
                        <Badge variant={getPickupRequestPaymentTone(pickupRequest.paymentStatus)}>
                          {pickupRequestPaymentStatusLabels[pickupRequest.paymentStatus]}
                        </Badge>
                        <Badge variant={getPickupRequestEmailTone(pickupRequest.emailStatus)}>
                          {pickupRequestEmailStatusLabels[pickupRequest.emailStatus]}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-[#5f6368]">
                        <p className="truncate">{pickupRequest.email}</p>
                        <p className="truncate">{hint.label}</p>
                        <p className="truncate">Cart: {pickupRequest.cartId}</p>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-10 w-full rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
                        >
                          <Link href={`/dashboard/tienda/pedidos/${pickupRequest.id}`}>
                            Abrir detalle
                          </Link>
                        </Button>
                        <DeletePickupRequestButton
                          pickupRequestId={pickupRequest.id}
                          description={`Esta accion no se puede deshacer. Se eliminara el pedido ${pickupRequest.requestNumber} y su historial operativo asociado.`}
                          label="Eliminar"
                          size="sm"
                          className="h-10 w-full rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
                        />
                      </div>
                    </AdminSurface>
                  );
                })}
              </div>

              <AdminSurface className="hidden overflow-hidden border-black/10 md:block">
                <div className="border-b border-black/8 bg-black/[0.02] px-5 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7a7f87]">
                    Arrastra horizontalmente sobre la tabla para leer toda la fila. La accion queda fija a la derecha.
                  </p>
                </div>
                <DraggableHorizontalScroll>
                  <Table className="min-w-[1180px] text-sm">
                    <TableHeader>
                      <TableRow className="bg-black/[0.03] hover:bg-black/[0.03]">
                        <TableHead className="h-11 w-[220px] px-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          <div className="flex items-center gap-2">
                            <ReceiptText className="h-3.5 w-3.5" />
                            Pedido
                          </div>
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          <div className="flex items-center gap-2">
                            <UserRound className="h-3.5 w-3.5" />
                            Cliente
                          </div>
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          <div className="flex items-center gap-2">
                            <WalletCards className="h-3.5 w-3.5" />
                            Importe
                          </div>
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          Estado
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          Pago
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          Email
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5" />
                            Fecha
                          </div>
                        </TableHead>
                        <TableHead className="h-11 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87]">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Foco
                          </div>
                        </TableHead>
                        <TableHead className="sticky right-0 z-10 h-11 bg-[#f7f7f5] px-5 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[#7a7f87] shadow-[-10px_0_18px_-18px_rgba(17,17,17,0.55)]">
                          Accion
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPickupRequests.map((pickupRequest) => {
                        const hint = getPickupRequestOperationalHint(pickupRequest);

                        return (
                          <TableRow
                            key={pickupRequest.id}
                            className="group border-black/6 hover:bg-[#fbfbf8]"
                          >
                            <TableCell className="px-5 py-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-black/6 bg-[#111111] text-white">
                                    <ReceiptText className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-[#111111]">
                                      {pickupRequest.requestNumber}
                                    </p>
                                    <p className="truncate text-[11px] text-[#7a7f87]">
                                      {pickupRequest.cartId}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#111111]">
                                  {pickupRequest.email}
                                </p>
                                <p className="truncate text-[12px] text-[#5f6368]">
                                  {pickupRequest.customerId
                                    ? `Socio ${pickupRequest.customerId}`
                                    : "Invitado"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <p className="text-sm font-bold text-[#111111]">
                                {formatCartAmount(pickupRequest.total, pickupRequest.currencyCode)}
                              </p>
                              <p className="text-[12px] text-[#5f6368]">
                                {pickupRequest.itemCount} producto
                                {pickupRequest.itemCount === 1 ? "" : "s"}
                              </p>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge
                                variant={getPickupRequestStatusTone(pickupRequest.status)}
                                className="text-[9px] font-black uppercase tracking-[0.12em]"
                              >
                                {pickupRequestStatusLabels[pickupRequest.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge
                                variant={getPickupRequestPaymentTone(
                                  pickupRequest.paymentStatus,
                                )}
                                className="text-[9px] font-black uppercase tracking-[0.12em]"
                              >
                                {pickupRequestPaymentStatusLabels[pickupRequest.paymentStatus]}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <Badge
                                variant={getPickupRequestEmailTone(pickupRequest.emailStatus)}
                                className="text-[9px] font-black uppercase tracking-[0.12em]"
                              >
                                {pickupRequestEmailStatusLabels[pickupRequest.emailStatus]}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <p className="text-sm font-medium text-[#111111]">
                                {compactDate(pickupRequest.createdAt)}
                              </p>
                              <p className="text-[12px] text-[#5f6368]">
                                {formatDate(pickupRequest.updatedAt)}
                              </p>
                            </TableCell>
                            <TableCell className="max-w-[260px] px-4 py-4">
                              <p className="truncate text-sm font-medium text-[#111111]">
                                {hint.label}
                              </p>
                              <p className="truncate text-[12px] text-[#5f6368]">
                                {hint.description}
                              </p>
                            </TableCell>
                            <TableCell className="sticky right-0 z-10 bg-white px-5 py-4 text-right shadow-[-10px_0_18px_-18px_rgba(17,17,17,0.55)] group-hover:bg-[#fbfbf8]">
                              <div className="flex justify-end gap-2">
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 rounded-none px-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#111111] opacity-70 group-hover:opacity-100"
                                >
                                  <Link
                                    href={`/dashboard/tienda/pedidos/${pickupRequest.id}`}
                                    className="inline-flex items-center gap-2"
                                  >
                                    Ver
                                    <ArrowUpRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <DeletePickupRequestButton
                                  pickupRequestId={pickupRequest.id}
                                  description={`Esta accion no se puede deshacer. Se eliminara el pedido ${pickupRequest.requestNumber} y su historial operativo asociado.`}
                                  label="Eliminar"
                                  size="sm"
                                  className="h-9 rounded-none px-3 text-[10px] font-black uppercase tracking-[0.14em]"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </DraggableHorizontalScroll>
              </AdminSurface>
            </>
          )}
        </div>
      </AdminSection>
    </div>
  );
}
