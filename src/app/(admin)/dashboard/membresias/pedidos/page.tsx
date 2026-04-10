import {
  Activity,
  ArrowUpDown,
  Download,
  QrCode,
  Search,
  ShieldCheck,
  Wallet,
  Users,
  FileText,
  Calendar,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

import AdminMetricCard from "@/components/admin/AdminMetricCard";
import AdminSection from "@/components/admin/AdminSection";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import MembershipOpsSubnav from "@/components/admin/MembershipOpsSubnav";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_MEMBERSHIP_REQUEST_FILTERS,
  filterAndSortMembershipRequests,
  parseMembershipRequestFilters,
  summarizeMembershipRequests,
} from "@/lib/data/membership-request-dashboard";
import { listMembershipRequests } from "@/lib/data/memberships";
import {
  getMembershipCommerceSyncTone,
  membershipManualPaymentStatusLabels,
  membershipCommerceSyncStatusLabels,
  membershipRequestStatusLabels,
  membershipValidationStatusLabels,
} from "@/lib/memberships";
import { formatCartAmount } from "@/lib/cart/format";

export default async function DashboardMembershipRequestsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const params = await searchParams;
  const filters = parseMembershipRequestFilters(params);
  const requests = await listMembershipRequests({
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    q: filters.q || undefined,
    status: filters.status === "all" ? undefined : filters.status,
  });
  const filteredRequests = filterAndSortMembershipRequests(requests, filters);
  const summary = summarizeMembershipRequests(filteredRequests);
  const exportParams = new URLSearchParams();

  if (filters.q) exportParams.set("q", filters.q);
  if (filters.status !== "all") exportParams.set("status", filters.status);
  if (filters.attention !== "all") exportParams.set("attention", filters.attention);
  if (filters.dateFrom) exportParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) exportParams.set("dateTo", filters.dateTo);
  if (filters.sort !== DEFAULT_MEMBERSHIP_REQUEST_FILTERS.sort) {
    exportParams.set("sort", filters.sort);
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="MEMBERSHIP OPS"
          description="Bandeja dedicada para altas, renovaciones, cobros manuales y validacion por QR."
          icon={QrCode}
          eyebrow="Fase 2 · Membresias"
          className="pb-0"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/membresias/recepcion"
            className="flex h-12 items-center justify-center border border-black/10 bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            Recepcion QR
          </Link>
          <Link
            href="/dashboard/miembros"
            className="flex h-12 items-center justify-center border border-black/10 bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            Crear desde ficha del socio
          </Link>
          <Link
            href={`/api/dashboard/membership-requests/export${exportParams.toString() ? `?${exportParams.toString()}` : ""}`}
            className="flex h-12 items-center justify-center gap-2 bg-[#111111] px-6 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#d71920]"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Link>
        </div>
      </div>

      <MembershipOpsSubnav />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard
          label="SOLICITUDES"
          value={String(summary.total)}
          hint="Ciclos visibles en la bandeja."
          icon={Activity}
          className="border-none shadow-md"
        />
        <AdminMetricCard
          label="AL DIA"
          value={String(summary.active)}
          hint="QR con validacion positiva."
          tone="success"
          icon={ShieldCheck}
          className="border-none shadow-md"
        />
        <AdminMetricCard
          label="PAGO EN CURSO"
          value={String(summary.pendingPayment)}
          hint="Cobro o activacion pendiente."
          tone="warning"
          icon={Wallet}
          className="border-none shadow-md"
        />
        <AdminMetricCard
          label="INCIDENCIAS"
          value={String(summary.actionRequired + summary.expired)}
          hint="Vencidas o con accion manual."
          tone="warning"
          icon={QrCode}
          className="border-none shadow-md"
        />
      </div>

      <AdminSection
        title="Solicitudes por ciclo"
        description="La bandeja consolida reservas, renovaciones y cobros manuales sin mezclar este dominio con pedidos pickup."
      >
        <div className="space-y-6">
          <form className="grid gap-4 xl:grid-cols-[1.2fr_220px_220px_220px_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/20" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder="Buscar por solicitud, socio, email o plan..."
                className="flex h-12 w-full border border-black/10 bg-[#fbfbf8] pl-11 pr-4 text-sm font-medium outline-none focus:bg-white focus:ring-1 focus:ring-[#d71920]/10"
              />
            </div>

            <select
              name="status"
              defaultValue={filters.status}
              className="flex h-12 w-full border border-black/10 bg-white px-4 text-xs font-black uppercase outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="requested">Solicitada</option>
              <option value="confirmed">Confirmada</option>
              <option value="active">Activa</option>
              <option value="paused">Pausada</option>
              <option value="expired">Vencida</option>
              <option value="cancelled">Cancelada</option>
            </select>

            <input
              type="date"
              name="dateFrom"
              defaultValue={filters.dateFrom}
              className="flex h-12 w-full border border-black/10 bg-white px-4 text-xs font-black uppercase outline-none"
            />

            <input
              type="date"
              name="dateTo"
              defaultValue={filters.dateTo}
              className="flex h-12 w-full border border-black/10 bg-white px-4 text-xs font-black uppercase outline-none"
            />

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 border border-black/10 bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] transition-colors hover:bg-[#111111] hover:text-white"
            >
              <ArrowUpDown className="h-4 w-4" />
              Filtrar
            </button>
          </form>

          <div className="overflow-hidden border border-black/10 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-none bg-black/5 hover:bg-black/5">
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>Solicitud</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>Socio</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Plan / ciclo</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-3 w-3" />
                      <span>Cobro</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Validacion</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3" />
                      <span>Mirror</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-[#111111]">
                    <div className="flex items-center justify-end gap-2">
                      <span>Accion</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-black/5 hover:bg-[#fbfbf8]">
                    <TableCell>
                      <div className="space-y-1 py-1">
                        <p className="text-sm font-black uppercase tracking-tight text-[#111111]">
                          {request.requestNumber}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7a7f87]">
                          {request.email}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={request.status === "active" ? "success" : "muted"} className="font-black uppercase text-[9px] tracking-tighter">
                            {membershipRequestStatusLabels[request.status]}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-bold uppercase tracking-tight text-[#111111]">
                          {request.member.fullName}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#7a7f87]">
                          {request.member.memberNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#111111]">
                          {request.planTitleSnapshot}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#7a7f87]">
                          {request.cycleStartsOn ?? "Pendiente"} · {request.cycleEndsOn ?? "Pendiente"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-[#111111]">
                          {formatCartAmount(request.manualPaymentSummary.paidTotal, request.currencyCode)}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#7a7f87]">
                          Pendiente {formatCartAmount(request.manualPaymentSummary.balanceDue, request.currencyCode)}
                        </p>
                        <Badge
                          variant={
                            request.manualPaymentSummary.status === "paid" ||
                            request.manualPaymentSummary.status === "overpaid"
                              ? "success"
                              : request.manualPaymentSummary.status === "partial"
                                ? "warning"
                                : "muted"
                          }
                          className="font-black uppercase text-[9px] tracking-tighter"
                        >
                          {membershipManualPaymentStatusLabels[request.manualPaymentSummary.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={request.validation.tone === "success" ? "success" : "warning"} className="font-black uppercase text-[9px] tracking-tighter">
                          {membershipValidationStatusLabels[request.validation.status]}
                        </Badge>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#7a7f87]">
                          {request.validation.label}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant={
                            getMembershipCommerceSyncTone(request.commerce.syncStatus) === "success"
                              ? "success"
                              : getMembershipCommerceSyncTone(request.commerce.syncStatus) === "warning"
                                ? "warning"
                                : "muted"
                          }
                          className="font-black uppercase text-[9px] tracking-tighter"
                        >
                          {membershipCommerceSyncStatusLabels[request.commerce.syncStatus]}
                        </Badge>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#7a7f87]">
                          {request.commerce.orderId
                            ? `Order ${request.commerce.orderId}`
                            : request.commerce.productId
                              ? "Producto tecnico listo"
                              : "Pendiente de reflejo"}
                        </p>
                        {request.commerce.syncError ? (
                          <p className="text-[11px] leading-5 text-[#b42318]">
                            {request.commerce.syncError}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/membresias/pedidos/${request.id}`}
                        className="inline-flex h-9 items-center border border-black/10 bg-white px-4 text-[9px] font-black uppercase tracking-widest text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
                      >
                        Ver detalle
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRequests.length === 0 ? (
              <div className="border-t border-black/5 bg-[#fbfbf8] p-8 text-center">
                <p className="text-sm font-semibold text-[#111111]">
                  No hay solicitudes de membresia con estos filtros.
                </p>
                <p className="mt-2 text-sm leading-7 text-[#5f6368]">
                  Puedes crear renovaciones desde la ficha del socio y volver luego a esta bandeja.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </AdminSection>
    </div>
  );
}
