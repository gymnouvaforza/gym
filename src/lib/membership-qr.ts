export type MembershipQrReasonCode =
  | "ok"
  | "invalid_format"
  | "member_not_found"
  | "inactive_membership"
  | "expired_membership"
  | "payment_pending"
  | "forbidden"
  | "server_error";

export type MembershipQrResponseStatus = "ok" | "blocked" | "error";

export type MembershipQrRequestStatus =
  | "requested"
  | "confirmed"
  | "active"
  | "paused"
  | "expired"
  | "cancelled";

export type MembershipQrManualPaymentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "overpaid";

export interface MembershipQrValidationMember {
  branchName: string | null;
  email: string;
  fullName: string;
  id: string;
  memberNumber: string;
  membershipQrToken: string;
  phone: string | null;
  planTitle: string | null;
  status: string;
  trainerName: string | null;
}

export interface MembershipQrValidationMembershipRequest {
  cycleEndsOn: string | null;
  cycleStartsOn: string | null;
  id: string;
  planTitle: string;
  requestNumber: string;
  status: MembershipQrRequestStatus;
}

export interface MembershipQrValidationResponse {
  canEnter: boolean;
  errorMessage: string | null;
  member: MembershipQrValidationMember | null;
  membershipRequest: MembershipQrValidationMembershipRequest | null;
  publicValidationUrl: string | null;
  reasonCode: MembershipQrReasonCode;
  scannedToken: string | null;
  status: MembershipQrResponseStatus;
  validationLabel: string;
}

export interface MembershipQrLookupInput {
  member: MembershipQrValidationMember | null;
  membershipRequest: MembershipQrValidationMembershipRequest | null;
  publicValidationUrl?: string | null;
  scannedToken?: string | null;
  scannedValue: string;
}

export const MEMBERSHIP_QR_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIsoDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function startOfTodayUtcMs() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function parseMembershipQrScannedValue(input: string) {
  const normalized = input.trim();

  if (!normalized) {
    return null;
  }

  const extractTokenFromPath = (pathname: string) => {
    const match = pathname.match(/\/validacion\/membresia\/([^/?#]+)/i);
    const candidate = match?.[1] ? decodeURIComponent(match[1]).trim() : "";

    return MEMBERSHIP_QR_UUID_PATTERN.test(candidate) ? candidate : null;
  };

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      return extractTokenFromPath(new URL(normalized).pathname);
    } catch {
      return null;
    }
  }

  if (normalized.startsWith("/")) {
    return extractTokenFromPath(normalized);
  }

  return MEMBERSHIP_QR_UUID_PATTERN.test(normalized) ? normalized : null;
}

export function buildMembershipQrPublicValidationUrl(baseUrl: string, token: string) {
  return new URL(`/validacion/membresia/${token}`, baseUrl).toString();
}

export function isMembershipQrValidationResponse(
  value: unknown,
): value is MembershipQrValidationResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MembershipQrValidationResponse>;

  return (
    typeof candidate.reasonCode === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.validationLabel === "string" &&
    typeof candidate.canEnter === "boolean"
  );
}

export function shouldPromoteMembershipRequestToActive(input: {
  manualPaymentStatus: MembershipQrManualPaymentStatus;
  status: MembershipQrRequestStatus;
}) {
  return (
    (input.manualPaymentStatus === "paid" || input.manualPaymentStatus === "overpaid") &&
    input.status !== "active"
  );
}

function resolveBlockedResponse(input: {
  member: MembershipQrValidationMember | null;
  membershipRequest: MembershipQrValidationMembershipRequest | null;
  publicValidationUrl?: string | null;
  reasonCode: Exclude<MembershipQrReasonCode, "ok" | "forbidden" | "server_error">;
  scannedToken: string | null;
  validationLabel: string;
}): MembershipQrValidationResponse {
  return {
    status: "blocked",
    reasonCode: input.reasonCode,
    canEnter: false,
    validationLabel: input.validationLabel,
    member: input.member,
    membershipRequest: input.membershipRequest,
    publicValidationUrl: input.publicValidationUrl ?? null,
    scannedToken: input.scannedToken,
    errorMessage: null,
  };
}

export function createMembershipQrErrorResponse(input: {
  errorMessage: string;
  reasonCode?: Extract<MembershipQrReasonCode, "forbidden" | "server_error">;
  validationLabel?: string;
}): MembershipQrValidationResponse {
  return {
    status: "error",
    reasonCode: input.reasonCode ?? "server_error",
    canEnter: false,
    validationLabel: input.validationLabel ?? "No pudimos validar el QR",
    member: null,
    membershipRequest: null,
    publicValidationUrl: null,
    scannedToken: null,
    errorMessage: input.errorMessage,
  };
}

export function resolveMembershipQrValidation(
  input: MembershipQrLookupInput,
): MembershipQrValidationResponse {
  const scannedToken = input.scannedToken ?? parseMembershipQrScannedValue(input.scannedValue);

  if (!scannedToken) {
    return resolveBlockedResponse({
      reasonCode: "invalid_format",
      validationLabel: "QR no reconocido",
      member: null,
      membershipRequest: null,
      publicValidationUrl: null,
      scannedToken: null,
    });
  }

  if (!input.member) {
    return resolveBlockedResponse({
      reasonCode: "member_not_found",
      validationLabel: "QR sin socio vinculado",
      member: null,
      membershipRequest: null,
      publicValidationUrl: input.publicValidationUrl,
      scannedToken,
    });
  }

  if (!input.membershipRequest) {
    return resolveBlockedResponse({
      reasonCode: "inactive_membership",
      validationLabel: "Socio sin membresia operativa",
      member: input.member,
      membershipRequest: null,
      publicValidationUrl: input.publicValidationUrl,
      scannedToken,
    });
  }

  const cycleStartsMs = parseIsoDate(input.membershipRequest.cycleStartsOn);
  const cycleEndsMs = parseIsoDate(input.membershipRequest.cycleEndsOn);
  const todayMs = startOfTodayUtcMs();

  if (input.membershipRequest.status === "paused" || input.membershipRequest.status === "cancelled") {
    return resolveBlockedResponse({
      reasonCode: "inactive_membership",
      validationLabel:
        input.membershipRequest.status === "paused"
          ? "Membresia pausada"
          : "Membresia cancelada",
      member: input.member,
      membershipRequest: input.membershipRequest,
      publicValidationUrl: input.publicValidationUrl,
      scannedToken,
    });
  }

  if (
    input.membershipRequest.status === "expired" ||
    (cycleEndsMs !== null && cycleEndsMs < todayMs)
  ) {
    return resolveBlockedResponse({
      reasonCode: "expired_membership",
      validationLabel: "Membresia vencida",
      member: input.member,
      membershipRequest: input.membershipRequest,
      publicValidationUrl: input.publicValidationUrl,
      scannedToken,
    });
  }

  if (cycleStartsMs !== null && cycleStartsMs > todayMs) {
    return resolveBlockedResponse({
      reasonCode: "inactive_membership",
      validationLabel: "Ciclo aun no iniciado",
      member: input.member,
      membershipRequest: input.membershipRequest,
      publicValidationUrl: input.publicValidationUrl,
      scannedToken,
    });
  }

  if (input.membershipRequest.status !== "active") {
    return resolveBlockedResponse({
      reasonCode: "payment_pending",
      validationLabel: "Pago o activacion pendiente",
      member: input.member,
      membershipRequest: input.membershipRequest,
      publicValidationUrl: input.publicValidationUrl,
      scannedToken,
    });
  }

  return {
    status: "ok",
    reasonCode: "ok",
    canEnter: true,
    validationLabel: "Membresia al dia",
    member: input.member,
    membershipRequest: input.membershipRequest,
    publicValidationUrl: input.publicValidationUrl ?? null,
    scannedToken,
    errorMessage: null,
  };
}
