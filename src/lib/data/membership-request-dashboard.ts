import type { MembershipRequestDetail, MembershipRequestStatus } from "@/lib/memberships";

export type MembershipRequestSort = "updated_desc" | "created_desc" | "created_asc";
export type MembershipRequestAttentionFilter =
  | "all"
  | "action_required"
  | "active"
  | "pending_payment"
  | "expired";

export interface MembershipRequestFilters {
  q: string;
  status: MembershipRequestStatus | "all";
  attention: MembershipRequestAttentionFilter;
  dateFrom: string;
  dateTo: string;
  sort: MembershipRequestSort;
}

export interface MembershipRequestOperationalSummary {
  actionRequired: number;
  expired: number;
  active: number;
  pendingPayment: number;
  total: number;
}

export const DEFAULT_MEMBERSHIP_REQUEST_FILTERS: MembershipRequestFilters = {
  q: "",
  status: "all",
  attention: "all",
  dateFrom: "",
  dateTo: "",
  sort: "updated_desc",
};

function parseFilterDate(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return "";
  }

  return normalized;
}

function resolveDayRange(date: string, boundary: "start" | "end") {
  return new Date(
    `${date}${boundary === "start" ? "T00:00:00.000Z" : "T23:59:59.999Z"}`,
  ).getTime();
}

export function parseMembershipRequestFilters(
  params: Record<string, string | string[] | undefined>,
): MembershipRequestFilters {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const dateFrom = parseFilterDate(params.dateFrom);
  const dateTo = parseFilterDate(params.dateTo);

  let status: MembershipRequestFilters["status"] = "all";
  if (
    params.status === "requested" ||
    params.status === "confirmed" ||
    params.status === "active" ||
    params.status === "paused" ||
    params.status === "expired" ||
    params.status === "cancelled"
  ) {
    status = params.status;
  }

  let attention: MembershipRequestAttentionFilter = "all";
  if (
    params.attention === "action_required" ||
    params.attention === "active" ||
    params.attention === "pending_payment" ||
    params.attention === "expired"
  ) {
    attention = params.attention;
  }

  let sort: MembershipRequestSort = "updated_desc";
  if (
    params.sort === "updated_desc" ||
    params.sort === "created_desc" ||
    params.sort === "created_asc"
  ) {
    sort = params.sort;
  }

  return {
    q,
    status,
    attention,
    dateFrom,
    dateTo,
    sort,
  };
}

export function getMembershipRequestAttentionBucket(
  request: MembershipRequestDetail,
): Exclude<MembershipRequestAttentionFilter, "all"> {
  if (
    request.commerce.syncStatus === "error" ||
    request.emailStatus === "failed" ||
    request.status === "cancelled"
  ) {
    return "action_required";
  }

  if (request.validation.status === "vencido" || request.status === "expired") {
    return "expired";
  }

  if (request.validation.status === "al_dia" && request.status === "active") {
    return "active";
  }

  return "pending_payment";
}

export function filterAndSortMembershipRequests(
  requests: MembershipRequestDetail[],
  filters: MembershipRequestFilters,
) {
  let filtered = [...requests];

  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter((request) =>
      [
        request.requestNumber,
        request.email,
        request.planTitleSnapshot,
        request.member.fullName,
        request.member.memberNumber,
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }

  if (filters.status !== "all") {
    filtered = filtered.filter((request) => request.status === filters.status);
  }

  if (filters.attention !== "all") {
    filtered = filtered.filter(
      (request) => getMembershipRequestAttentionBucket(request) === filters.attention,
    );
  }

  if (filters.dateFrom) {
    const from = resolveDayRange(filters.dateFrom, "start");
    filtered = filtered.filter((request) => new Date(request.createdAt).getTime() >= from);
  }

  if (filters.dateTo) {
    const to = resolveDayRange(filters.dateTo, "end");
    filtered = filtered.filter((request) => new Date(request.createdAt).getTime() <= to);
  }

  filtered.sort((left, right) => {
    switch (filters.sort) {
      case "created_asc":
        return left.createdAt.localeCompare(right.createdAt);
      case "created_desc":
        return right.createdAt.localeCompare(left.createdAt);
      case "updated_desc":
      default:
        return right.updatedAt.localeCompare(left.updatedAt);
    }
  });

  return filtered;
}

export function summarizeMembershipRequests(
  requests: MembershipRequestDetail[],
): MembershipRequestOperationalSummary {
  return requests.reduce<MembershipRequestOperationalSummary>(
    (summary, request) => {
      summary.total += 1;

      switch (getMembershipRequestAttentionBucket(request)) {
        case "action_required":
          summary.actionRequired += 1;
          break;
        case "active":
          summary.active += 1;
          break;
        case "expired":
          summary.expired += 1;
          break;
        case "pending_payment":
        default:
          summary.pendingPayment += 1;
          break;
      }

      return summary;
    },
    {
      total: 0,
      active: 0,
      actionRequired: 0,
      expired: 0,
      pendingPayment: 0,
    },
  );
}

export function getMembershipOperationalHint(request: MembershipRequestDetail) {
  if (request.commerce.syncStatus === "error") {
    return {
      label: "Mirror comercial pendiente",
      description:
        "La solicitud operativa ya existe en Supabase, pero el reflejo tecnico en Medusa fallo y conviene reintentarlo.",
      tone: "warning" as const,
    };
  }

  if (request.validation.status === "vencido" || request.status === "expired") {
    return {
      label: "Renovar o cerrar ciclo",
      description:
        "La vigencia ya no cubre al socio. Decide si renovais con una nueva solicitud o si se cierra el caso.",
      tone: "warning" as const,
    };
  }

  if (request.manualPaymentSummary.status === "partial") {
    return {
      label: "Cobro en progreso",
      description:
        "El socio ya dejo un abono. El siguiente paso es completar el saldo o confirmar un acuerdo manual de pago.",
      tone: "default" as const,
    };
  }

  if (request.validation.status === "al_dia") {
    return {
      label: "Acceso operativo vigente",
      description:
        "La membresia esta cubierta y el QR deberia validar correctamente en recepcion.",
      tone: "success" as const,
    };
  }

  return {
    label: "Solicitud pendiente",
    description:
      "Falta confirmar cobro o activar el ciclo para dejar la membresia totalmente operativa.",
    tone: "muted" as const,
  };
}
