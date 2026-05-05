// Reception check-in data layer: search members, compute access snapshots, record attendance.
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { DBMemberCheckin } from "@/lib/supabase/database.types";
import { getMemberFinancials } from "@/lib/data/member-finance";

export type ReceptionMemberSearchResult = {
  id: string;
  memberNumber: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  branchName: string | null;
};

export type ReceptionMembershipSnapshot = {
  id: string | null;
  requestNumber: string | null;
  planTitle: string | null;
  status: string | null;
  cycleStartsOn: string | null;
  cycleEndsOn: string | null;
  balanceDue: number;
  priceAmount: number | null;
  currencyCode: string | null;
};

export type ReceptionAccessStatus =
  | "active"
  | "expires_today"
  | "expired"
  | "paused"
  | "cancelled"
  | "former"
  | "no_membership"
  | "unknown";

export type ReceptionAccessInfo = {
  status: ReceptionAccessStatus;
  label: string;
  tone: "success" | "warning" | "error" | "muted" | "info";
  message: string;
  validUntil: string | null;
};

export type ReceptionMemberSnapshot = {
  member: {
    id: string;
    memberNumber: string;
    fullName: string;
    email: string;
    phone: string | null;
    status: string;
    branchName: string | null;
    notes: string | null;
  };
  membership: ReceptionMembershipSnapshot;
  access: ReceptionAccessInfo;
  recentCheckins: DBMemberCheckin[];
};

export type CheckinInput = {
  memberId: string;
  method?: "manual" | "qr" | "reception";
  notes?: string | null;
  registeredByUserId?: string | null;
  registeredByEmail?: string | null;
};

export type TodayCheckinItem = {
  id: string;
  checkedInAt: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  statusSnapshot: string;
  method: string;
  registeredByEmail: string | null;
};

type CheckinClient = ReturnType<typeof createSupabaseAdminClient>;

/**
 * Escapes special characters in PostgREST .or() filter strings.
 * PostgREST uses commas and parentheses as separators, so they must be escaped.
 */
function escapePostgrestChars(value: string): string {
  return value.replace(/,/g, "\\,").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Normalizes phone number by removing all non-digit characters.
 * Used for flexible phone search (e.g., "+51 999 888 777" → "51999888777")
 */
function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeToDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function resolveAccessStatus(
  memberStatus: string,
  financials: Awaited<ReturnType<typeof getMemberFinancials>>,
): ReceptionAccessInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Member-level statuses take precedence
  if (memberStatus === "paused") {
    return {
      status: "paused",
      label: "PAUSADO",
      tone: "info",
      message: "Membresia pausada",
      validUntil: null,
    };
  }

  if (memberStatus === "cancelled") {
    return {
      status: "cancelled",
      label: "CANCELADO",
      tone: "error",
      message: "Membresia cancelada",
      validUntil: null,
    };
  }

  if (memberStatus === "former") {
    return {
      status: "former",
      label: "EX-SOCIO",
      tone: "muted",
      message: "Ficha archivada",
      validUntil: null,
    };
  }

  if (memberStatus === "prospect") {
    return {
      status: "no_membership",
      label: "PROSPECTO",
      tone: "warning",
      message: "Sin membresia activa",
      validUntil: null,
    };
  }

  if (!financials) {
    return {
      status: "no_membership",
      label: "SIN MEMBRESIA",
      tone: "warning",
      message: "Sin membresia activa",
      validUntil: null,
    };
  }

  const endDate = normalizeToDate(financials.endDate);

  if (!endDate) {
    return {
      status: "unknown",
      label: "DESCONOCIDO",
      tone: "muted",
      message: "Fecha de vencimiento no definida",
      validUntil: null,
    };
  }

  const endKey = dateKey(endDate);
  const todayKey = dateKey(today);

  if (endKey === todayKey) {
    return {
      status: "expires_today",
      label: "VENCE HOY",
      tone: "warning",
      message: `Vence hoy`,
      validUntil: financials.endDate,
    };
  }

  if (endDate < today) {
    return {
      status: "expired",
      label: "VENCIDO",
      tone: "error",
      message: `Vencido desde ${endDate.toLocaleDateString("es-PE")}`,
      validUntil: financials.endDate,
    };
  }

  return {
    status: "active",
    label: "ACTIVO",
    tone: "success",
    message: `Activo hasta ${endDate.toLocaleDateString("es-PE")}`,
    validUntil: financials.endDate,
  };
}

/**
 * @deprecated Fallback search implementation using direct PostgREST queries.
 * Use search_member_profiles RPC when available (see searchReceptionMembers).
 */
async function searchReceptionMembersFallback(
  db: CheckinClient,
  normalized: string,
): Promise<ReceptionMemberSearchResult[]> {
  // Escape special PostgREST characters to prevent parsing errors
  const escaped = escapePostgrestChars(normalized);

  // Create phone search variant (digits only) for flexible phone matching
  const phoneSearch = normalizePhone(normalized);
  const hasPhoneVariant = phoneSearch !== normalized && phoneSearch.length > 0;

  // Build OR conditions with escaped values
  // Include external_code for legacy member search support
  let orConditions = `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,member_number.ilike.%${escaped}%,external_code.ilike.%${escaped}%`;

  // Add phone search: match original term OR cleaned digits-only variant
  if (hasPhoneVariant) {
    orConditions += `,phone.ilike.%${escaped}%,phone.ilike.%${phoneSearch}%`;
  } else {
    orConditions += `,phone.ilike.%${escaped}%`;
  }

  const { data, error } = await db
    .from("member_profiles")
    .select("id, member_number, full_name, email, phone, status, branch_name, external_code")
    .or(orConditions)
    .order("full_name", { ascending: true })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    memberNumber: row.member_number,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    branchName: row.branch_name,
  }));
}

export async function searchReceptionMembers(
  query: string,
  client?: CheckinClient,
): Promise<ReceptionMemberSearchResult[]> {
  const db = client ?? createSupabaseAdminClient();
  const normalized = query.trim();

  if (!normalized) {
    return [];
  }

  // Try RPC function first (T5 - robust SQL solution)
  try {
    const { data, error } = await db.rpc("search_member_profiles", {
      search_query: normalized,
    });

    if (!error && data) {
      return (data as unknown[]).map((row: unknown) => {
        const r = row as Record<string, unknown>;
        return {
          id: String(r.id),
          memberNumber: String(r.member_number),
          fullName: String(r.full_name),
          email: String(r.email),
          phone: r.phone ? String(r.phone) : null,
          status: String(r.status),
          branchName: r.branch_name ? String(r.branch_name) : null,
        };
      });
    }

    // If RPC returned error (e.g., function doesn't exist), fall through to fallback
    console.warn("search_member_profiles RPC not available, using fallback:", error?.message);
  } catch (rpcError) {
    // RPC not available, use fallback
    console.warn("search_member_profiles RPC error, using fallback:", rpcError);
  }

  // Fallback to direct query (T2 - hotfix with character escaping)
  return searchReceptionMembersFallback(db, normalized);
}

export async function getReceptionMemberSnapshot(
  memberId: string,
  client?: CheckinClient,
): Promise<ReceptionMemberSnapshot | null> {
  const db = client ?? createSupabaseAdminClient();

  const { data: member, error: memberError } = await db
    .from("member_profiles")
    .select("id, member_number, full_name, email, phone, status, branch_name, notes")
    .eq("id", memberId)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    return null;
  }

  const [financials, recentCheckins] = await Promise.all([
    getMemberFinancials(memberId, db),
    listMemberCheckins(memberId, 5, db),
  ]);

  const access = resolveAccessStatus(member.status, financials);

  const membership: ReceptionMembershipSnapshot = {
    id: financials?.id ?? null,
    requestNumber: null,
    planTitle: financials?.planTitle ?? null,
    status: financials?.status ?? null,
    cycleStartsOn: financials?.startDate ?? null,
    cycleEndsOn: financials?.endDate ?? null,
    balanceDue: financials?.balanceDue ?? 0,
    priceAmount: financials?.totalPrice ?? null,
    currencyCode: null,
  };

  return {
    member: {
      id: member.id,
      memberNumber: member.member_number,
      fullName: member.full_name,
      email: member.email,
      phone: member.phone,
      status: member.status,
      branchName: member.branch_name,
      notes: member.notes,
    },
    membership,
    access,
    recentCheckins,
  };
}

export async function createMemberCheckin(
  input: CheckinInput,
  client?: CheckinClient,
): Promise<DBMemberCheckin> {
  const db = client ?? createSupabaseAdminClient();
  const snapshot = await getReceptionMemberSnapshot(input.memberId, db);

  if (!snapshot) {
    throw new Error("Socio no encontrado.");
  }

  const membershipRequestId = snapshot.membership.id;
  const validUntil = snapshot.access.validUntil;

  const { data, error } = await db
    .from("member_checkins")
    .insert({
      member_id: input.memberId,
      membership_request_id: membershipRequestId,
      checked_in_at: new Date().toISOString(),
      method: input.method ?? "manual",
      status_snapshot: snapshot.access.status,
      membership_valid_until: validUntil,
      registered_by_user_id: input.registeredByUserId ?? null,
      registered_by_email: input.registeredByEmail ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as DBMemberCheckin;
}

export async function listTodayMemberCheckins(
  client?: CheckinClient,
): Promise<TodayCheckinItem[]> {
  const db = client ?? createSupabaseAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await db
    .from("member_checkins")
    .select(
      `
      id,
      checked_in_at,
      member_id,
      status_snapshot,
      method,
      registered_by_email,
      member_profiles!inner(full_name, member_number)
    `,
    )
    .gte("checked_in_at", today.toISOString())
    .lt("checked_in_at", tomorrow.toISOString())
    .order("checked_in_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: unknown) => {
    const r = row as Record<string, unknown>;
    const member = (r.member_profiles as Record<string, unknown> | null) ?? {};
    return {
      id: String(r.id),
      checkedInAt: String(r.checked_in_at),
      memberId: String(r.member_id),
      memberName: String(member.full_name ?? ""),
      memberNumber: String(member.member_number ?? ""),
      statusSnapshot: String(r.status_snapshot),
      method: String(r.method),
      registeredByEmail: r.registered_by_email ? String(r.registered_by_email) : null,
    };
  });
}

export async function listRecentMemberCheckins(
  limit = 10,
  client?: CheckinClient,
): Promise<TodayCheckinItem[]> {
  const db = client ?? createSupabaseAdminClient();

  const { data, error } = await db
    .from("member_checkins")
    .select(
      `
      id,
      checked_in_at,
      member_id,
      status_snapshot,
      method,
      registered_by_email,
      member_profiles!inner(full_name, member_number)
    `,
    )
    .order("checked_in_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: unknown) => {
    const r = row as Record<string, unknown>;
    const member = (r.member_profiles as Record<string, unknown> | null) ?? {};
    return {
      id: String(r.id),
      checkedInAt: String(r.checked_in_at),
      memberId: String(r.member_id),
      memberName: String(member.full_name ?? ""),
      memberNumber: String(member.member_number ?? ""),
      statusSnapshot: String(r.status_snapshot),
      method: String(r.method),
      registeredByEmail: r.registered_by_email ? String(r.registered_by_email) : null,
    };
  });
}

export async function listMemberCheckins(
  memberId: string,
  limit = 10,
  client?: CheckinClient,
): Promise<DBMemberCheckin[]> {
  const db = client ?? createSupabaseAdminClient();

  const { data, error } = await db
    .from("member_checkins")
    .select("*")
    .eq("member_id", memberId)
    .order("checked_in_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DBMemberCheckin[];
}
