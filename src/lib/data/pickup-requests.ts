import { cache } from "react";

import {
  mapPickupRequest,
  type MedusaPickupRequest,
} from "@/lib/cart/pickup-request";
import type {
  PickupRequestDetail,
  PickupRequestStatus,
} from "@/lib/cart/types";
import {
  listPickupRequests,
  reconcileRecentPickupRequests,
  retrievePickupRequest,
} from "@/lib/cart/member-bridge";
import { hasMedusaAdminEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export interface PickupRequestsSnapshot {
  pickupRequests: PickupRequestDetail[];
  count: number;
  warning: string | null;
}

type PickupRequestAnnotationRow =
  Database["public"]["Tables"]["pickup_request_annotations"]["Row"];
type PickupRequestPaymentEntryRow =
  Database["public"]["Tables"]["pickup_request_payment_entries"]["Row"];
type PickupRequestRow = Database["public"]["Tables"]["pickup_request"]["Row"];

export interface PickupRequestAnnotation {
  id: string;
  pickupRequestId: string;
  content: string;
  createdAt: string;
  createdByUserId: string | null;
  createdByEmail: string | null;
}

export interface PickupRequestManualPaymentSummary {
  paidTotal: number;
  balanceDue: number;
  status: "pending" | "partial" | "paid" | "overpaid";
  entryCount: number;
  updatedAt: string | null;
}

export interface PickupRequestPaymentEntry {
  id: string;
  pickupRequestId: string;
  amount: number;
  currencyCode: string;
  note: string | null;
  recordedAt: string;
  createdAt: string;
  createdByUserId: string | null;
  createdByEmail: string | null;
}

function mapPickupRequestAnnotation(row: PickupRequestAnnotationRow): PickupRequestAnnotation {
  return {
    id: row.id,
    pickupRequestId: row.pickup_request_id,
    content: row.content,
    createdAt: row.created_at,
    createdByUserId: row.created_by_user_id,
    createdByEmail: row.created_by_email,
  };
}

function mapPickupRequestManualPaymentSummary(
  row: Pick<PickupRequestRow, 
    "manual_paid_total" |
    "manual_balance_due" |
    "manual_payment_status" |
    "manual_payment_entry_count" |
    "manual_payment_updated_at"
  >,
): PickupRequestManualPaymentSummary {
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

function mapPickupRequestPaymentEntry(row: PickupRequestPaymentEntryRow): PickupRequestPaymentEntry {
  return {
    id: row.id,
    pickupRequestId: row.pickup_request_id,
    amount: row.amount,
    currencyCode: row.currency_code,
    note: row.note,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    createdByUserId: row.created_by_user_id,
    createdByEmail: row.created_by_email,
  };
}

function getPickupRequestsReadinessWarning() {
  if (!hasMedusaAdminEnv()) {
    return (
      "El dashboard de pedidos pickup requiere MEDUSA_ADMIN_API_KEY y MEDUSA_BACKEND_URL " +
      "(o NEXT_PUBLIC_MEDUSA_BACKEND_URL). Configuralos para operar solicitudes reales."
    );
  }

  return null;
}

export const getPickupRequestsSnapshot = cache(
  async (filters?: {
    status?: PickupRequestStatus | null;
    email?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<PickupRequestsSnapshot> => {
    const readinessWarning = getPickupRequestsReadinessWarning();

    if (readinessWarning) {
      return {
        pickupRequests: [],
        count: 0,
        warning: readinessWarning,
      };
    }

    try {
      const response = await listPickupRequests({
        status: filters?.status ?? null,
        email: filters?.email ?? null,
        limit: filters?.limit ?? 50,
        offset: filters?.offset ?? 0,
      });

      return {
        pickupRequests: (response.pickup_requests ?? []).map((pickupRequest) =>
          mapPickupRequest(pickupRequest as MedusaPickupRequest),
        ),
        count: response.count ?? 0,
        warning: null,
      };
    } catch (error) {
      return {
        pickupRequests: [],
        count: 0,
        warning:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los pedidos pickup.",
      };
    }
  },
);

export async function getPickupRequestById(id: string): Promise<PickupRequestDetail | null> {
  const readinessWarning = getPickupRequestsReadinessWarning();

  if (readinessWarning) {
    return null;
  }

  try {
    const response = await retrievePickupRequest(id);
    return mapPickupRequest(response.pickup_request as MedusaPickupRequest);
  } catch {
    return null;
  }
}

export async function listPickupRequestAnnotations(pickupRequestId: string) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("pickup_request_annotations")
    .select("*")
    .eq("pickup_request_id", pickupRequestId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapPickupRequestAnnotation);
}

export async function addPickupRequestAnnotation(input: {
  pickupRequestId: string;
  content: string;
  createdByUserId?: string | null;
  createdByEmail?: string | null;
}) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("pickup_request_annotations")
    .insert({
      pickup_request_id: input.pickupRequestId,
      content: input.content,
      created_by_user_id: input.createdByUserId ?? null,
      created_by_email: input.createdByEmail ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPickupRequestAnnotation(data);
}

export async function getPickupRequestManualPaymentSummary(pickupRequestId: string) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("pickup_request")
    .select(
      "manual_paid_total, manual_balance_due, manual_payment_status, manual_payment_entry_count, manual_payment_updated_at",
    )
    .eq("id", pickupRequestId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPickupRequestManualPaymentSummary(data);
}

export async function listPickupRequestManualPaymentSummaries(pickupRequestIds: string[]) {
  if (pickupRequestIds.length === 0) {
    return {};
  }

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("pickup_request")
    .select(
      "id, manual_paid_total, manual_balance_due, manual_payment_status, manual_payment_entry_count, manual_payment_updated_at",
    )
    .in("id", pickupRequestIds)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [
      row.id,
      mapPickupRequestManualPaymentSummary(row),
    ]),
  ) as Record<string, PickupRequestManualPaymentSummary>;
}

export async function listPickupRequestPaymentEntries(pickupRequestId: string) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("pickup_request_payment_entries")
    .select("*")
    .eq("pickup_request_id", pickupRequestId)
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapPickupRequestPaymentEntry);
}

export async function addPickupRequestPaymentEntry(input: {
  pickupRequestId: string;
  amount: number;
  currencyCode: string;
  note?: string | null;
  createdByUserId?: string | null;
  createdByEmail?: string | null;
}) {
  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from("pickup_request_payment_entries")
    .insert({
      pickup_request_id: input.pickupRequestId,
      amount: input.amount,
      currency_code: input.currencyCode,
      note: input.note ?? null,
      created_by_user_id: input.createdByUserId ?? null,
      created_by_email: input.createdByEmail ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPickupRequestPaymentEntry(data);
}

function matchesMemberPickupRequest(
  pickupRequest: PickupRequestDetail,
  input: {
    email?: string | null;
    supabaseUserId?: string | null;
  },
) {
  const email = input.email?.trim().toLowerCase() ?? null;
  const supabaseUserId = input.supabaseUserId?.trim() ?? null;

  return (
    (email && pickupRequest.email.trim().toLowerCase() === email) ||
    (supabaseUserId && pickupRequest.supabaseUserId === supabaseUserId)
  );
}

export async function getMemberPickupRequestById(input: {
  id: string;
  email?: string | null;
  supabaseUserId?: string | null;
}): Promise<PickupRequestDetail | null> {
  const pickupRequest = await getPickupRequestById(input.id);

  if (!pickupRequest) {
    return null;
  }

  if (!matchesMemberPickupRequest(pickupRequest, input)) {
    return null;
  }

  return pickupRequest;
}

export async function getLatestPickupRequestByEmail(email: string) {
  const snapshot = await getPickupRequestsSnapshot({
    email,
    limit: 1,
    offset: 0,
  });

  return snapshot.pickupRequests[0] ?? null;
}

function dedupePickupRequests(pickupRequests: PickupRequestDetail[]) {
  const uniquePickupRequests = new Map<string, PickupRequestDetail>();

  pickupRequests.forEach((pickupRequest) => {
    uniquePickupRequests.set(pickupRequest.id, pickupRequest);
  });

  return Array.from(uniquePickupRequests.values()).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function reconcileRecentPickupRequestsSnapshot(filters?: {
  hours?: number;
  limit?: number;
  email?: string | null;
}) {
  const readinessWarning = getPickupRequestsReadinessWarning();

  if (readinessWarning) {
    return {
      reconciledCount: 0,
      warning: readinessWarning,
    };
  }

  try {
    const response = await reconcileRecentPickupRequests({
      hours: filters?.hours ?? 24,
      limit: filters?.limit ?? 25,
      email: filters?.email ?? null,
    });

    return {
      reconciledCount: response.reconciled_count ?? 0,
      warning: null,
    };
  } catch (error) {
    return {
      reconciledCount: 0,
      warning:
        error instanceof Error
          ? error.message
          : "No se pudieron reconciliar los pedidos pickup recientes.",
    };
  }
}

export async function getMemberPickupRequestsHistory(input: {
  email?: string | null;
  supabaseUserId?: string | null;
}) {
  const readinessWarning = getPickupRequestsReadinessWarning();

  if (readinessWarning) {
    return {
      pickupRequests: [] as PickupRequestDetail[],
      warning: readinessWarning,
    };
  }

  const email = input.email?.trim().toLowerCase() ?? null;
  const supabaseUserId = input.supabaseUserId?.trim() ?? null;

  if (!email && !supabaseUserId) {
    return {
      pickupRequests: [] as PickupRequestDetail[],
      warning: null,
    };
  }

  try {
    if (email) {
      await reconcileRecentPickupRequestsSnapshot({
        email,
        hours: 24,
        limit: 10,
      });
    }

    const [byUserId, byEmail] = await Promise.all([
      supabaseUserId
        ? listPickupRequests({
            supabaseUserId,
            limit: 25,
            offset: 0,
          }).then((response) => ({
            warning: null,
            pickupRequests: (response.pickup_requests ?? []).map((pickupRequest) =>
              mapPickupRequest(pickupRequest as MedusaPickupRequest),
            ),
          }))
        : Promise.resolve({ warning: null, pickupRequests: [] as PickupRequestDetail[] }),
      email
        ? getPickupRequestsSnapshot({
            email,
            limit: 25,
            offset: 0,
            status: null,
          })
        : Promise.resolve({
            pickupRequests: [] as PickupRequestDetail[],
            count: 0,
            warning: null,
          }),
    ]);

    return {
      pickupRequests: dedupePickupRequests([
        ...byUserId.pickupRequests,
        ...byEmail.pickupRequests,
      ]),
      warning: byUserId.warning ?? byEmail.warning ?? null,
    };
  } catch (error) {
    return {
      pickupRequests: [] as PickupRequestDetail[],
      warning:
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial pickup del socio.",
    };
  }
}
