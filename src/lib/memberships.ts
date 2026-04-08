import type {
  DBMembershipPaymentEntry,
  DBMembershipPlan,
  DBMembershipRequest,
  DBMembershipRequestAnnotation,
  DBMemberProfile,
} from "@/lib/supabase/database.types";

export type MembershipRequestStatus =
  | "requested"
  | "confirmed"
  | "active"
  | "paused"
  | "expired"
  | "cancelled";

export type MembershipManualPaymentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "overpaid";

export type MembershipCommerceSyncStatus = "pending" | "ok" | "error";
export type MembershipValidationStatus = "al_dia" | "pendiente" | "vencido";

export type MembershipTone = "default" | "muted" | "success" | "warning";

export type MembershipPlan = DBMembershipPlan;

export type MembershipRequestAnnotation = DBMembershipRequestAnnotation;

export type MembershipPaymentEntry = DBMembershipPaymentEntry;

export interface MembershipMemberSummary {
  branchName: string | null;
  email: string;
  fullName: string;
  id: string;
  memberNumber: string;
  membershipQrToken: string;
  phone: string | null;
  status: DBMemberProfile["status"];
  supabaseUserId: string | null;
  trainerUserId: string | null;
  trainerName: string | null;
  trainingPlanLabel: string | null;
}

export interface MembershipManualPaymentSummary {
  balanceDue: number;
  entryCount: number;
  paidTotal: number;
  status: MembershipManualPaymentStatus;
  updatedAt: string | null;
}

export interface MembershipCommerceMirrorSummary {
  cartId: string | null;
  orderId: string | null;
  productId: string | null;
  syncError: string | null;
  syncStatus: MembershipCommerceSyncStatus;
  syncedAt: string | null;
  variantId: string | null;
}

export interface MembershipRequestDetail {
  activatedAt: string | null;
  billingLabel: string | null;
  commerce: MembershipCommerceMirrorSummary;
  createdAt: string;
  currencyCode: string;
  cycleEndsOn: string | null;
  cycleStartsOn: string | null;
  durationDays: number;
  email: string;
  emailError: string | null;
  emailSentAt: string | null;
  emailStatus: "pending" | "sent" | "failed";
  id: string;
  manualPaymentSummary: MembershipManualPaymentSummary;
  member: MembershipMemberSummary;
  notes: string | null;
  plan: MembershipPlan;
  planTitleSnapshot: string;
  priceAmount: number;
  renewsFromRequestId: string | null;
  requestNumber: string;
  source: string;
  status: MembershipRequestStatus;
  supabaseUserId: string | null;
  updatedAt: string;
  validation: MembershipValidation;
}

export interface MembershipReceptionScanResult {
  cycleEndsOn: string | null;
  cycleStartsOn: string | null;
  member: MembershipMemberSummary;
  membershipRequestId: string | null;
  planTitle: string;
  publicValidationUrl: string;
  requestNumber: string | null;
  requestStatus: MembershipRequestStatus | null;
  validation: MembershipValidation | null;
}

export interface MembershipValidation {
  cycleEndsOn: string | null;
  cycleStartsOn: string | null;
  label: string;
  status: MembershipValidationStatus;
  tone: MembershipTone;
}

export const membershipRequestStatusLabels: Record<MembershipRequestStatus, string> = {
  requested: "Solicitada",
  confirmed: "Confirmada",
  active: "Activa",
  paused: "Pausada",
  expired: "Vencida",
  cancelled: "Cancelada",
};

export const membershipManualPaymentStatusLabels: Record<
  MembershipManualPaymentStatus,
  string
> = {
  pending: "Sin abonos",
  partial: "Pago parcial",
  paid: "Pagada",
  overpaid: "Pagada con excedente",
};

export const membershipCommerceSyncStatusLabels: Record<
  MembershipCommerceSyncStatus,
  string
> = {
  pending: "Pendiente",
  ok: "OK",
  error: "Error",
};

export const membershipValidationStatusLabels: Record<
  MembershipValidationStatus,
  string
> = {
  al_dia: "Al dia",
  pendiente: "Pendiente",
  vencido: "Vencido",
};

export const membershipEmailStatusLabels: Record<
  MembershipRequestDetail["emailStatus"],
  string
> = {
  pending: "Pendiente",
  sent: "Enviado",
  failed: "Con error",
};

function parseDateToMs(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function startOfTodayMs() {
  const now = new Date();
  const normalized = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );

  return normalized.getTime();
}

export function getMembershipRequestStatusTone(status: MembershipRequestStatus): MembershipTone {
  switch (status) {
    case "active":
      return "success";
    case "paused":
    case "expired":
    case "cancelled":
      return "warning";
    case "confirmed":
      return "default";
    case "requested":
    default:
      return "muted";
  }
}

export function getMembershipManualPaymentTone(
  status: MembershipManualPaymentStatus,
): MembershipTone {
  switch (status) {
    case "paid":
    case "overpaid":
      return "success";
    case "partial":
      return "warning";
    case "pending":
    default:
      return "muted";
  }
}

export function getMembershipCommerceSyncTone(
  status: MembershipCommerceSyncStatus,
): MembershipTone {
  switch (status) {
    case "ok":
      return "success";
    case "error":
      return "warning";
    case "pending":
    default:
      return "muted";
  }
}

export function deriveMembershipValidation(input: {
  cycleEndsOn: string | null;
  cycleStartsOn: string | null;
  manualPaymentStatus: MembershipManualPaymentStatus;
  requestStatus: MembershipRequestStatus;
}) : MembershipValidation {
  const todayMs = startOfTodayMs();
  const cycleEndsMs = parseDateToMs(input.cycleEndsOn);
  const cycleStartsMs = parseDateToMs(input.cycleStartsOn);

  if (input.requestStatus === "cancelled" || input.requestStatus === "expired") {
    return {
      status: "vencido",
      label: "Sin vigencia operativa",
      tone: "warning",
      cycleStartsOn: input.cycleStartsOn,
      cycleEndsOn: input.cycleEndsOn,
    };
  }

  if (cycleEndsMs !== null && cycleEndsMs < todayMs) {
    return {
      status: "vencido",
      label: "Ciclo vencido",
      tone: "warning",
      cycleStartsOn: input.cycleStartsOn,
      cycleEndsOn: input.cycleEndsOn,
    };
  }

  if (
    (input.manualPaymentStatus === "paid" || input.manualPaymentStatus === "overpaid") &&
    (cycleStartsMs === null || cycleStartsMs <= todayMs)
  ) {
    return {
      status: "al_dia",
      label: "Membresia al dia",
      tone: "success",
      cycleStartsOn: input.cycleStartsOn,
      cycleEndsOn: input.cycleEndsOn,
    };
  }

  return {
    status: "pendiente",
    label: "Pago o activacion pendiente",
    tone: input.manualPaymentStatus === "partial" ? "warning" : "default",
    cycleStartsOn: input.cycleStartsOn,
    cycleEndsOn: input.cycleEndsOn,
  };
}

export function mapMembershipManualPaymentSummary(
  row: Pick<
    DBMembershipRequest,
    | "manual_paid_total"
    | "manual_balance_due"
    | "manual_payment_status"
    | "manual_payment_entry_count"
    | "manual_payment_updated_at"
  >,
): MembershipManualPaymentSummary {
  const status = row.manual_payment_status;

  return {
    paidTotal: row.manual_paid_total,
    balanceDue: row.manual_balance_due,
    status:
      status === "partial" || status === "paid" || status === "overpaid"
        ? status
        : "pending",
    entryCount: row.manual_payment_entry_count,
    updatedAt: row.manual_payment_updated_at,
  };
}
