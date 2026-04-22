import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  DBMemberMeasurement,
  DBMemberPayment,
  DBMembership,
  Database,
  Json,
} from "@/lib/supabase/database.types";
import { memberPaymentSchema, type MemberPaymentInput } from "@/lib/validators/member-finance";

type MemberFinanceClient = ReturnType<typeof createSupabaseAdminClient>;
type MembershipStatus = DBMembership["manual_activation_status"];

export type MemberPaymentDto = {
  id: string;
  amountPaid: number;
  paymentMethod: string;
  referenceCode: string | null;
  recordedAt: string;
};

export type MembershipDto = {
  id: string;
  planTitle: string | null;
  totalPrice: number;
  balanceDue: number;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  payments: MemberPaymentDto[];
};

export type MemberMeasurementDto = {
  id: string;
  weight: number | null;
  fatPercentage: number | null;
  perimeters: Record<string, number>;
  recordedAt: string;
};

type MembershipWithRelations = Pick<
  DBMembership,
  "balance_due" | "end_date" | "id" | "manual_activation_status" | "member_id" | "start_date" | "total_price"
> & {
  membership_plans: Pick<Database["public"]["Tables"]["membership_plans"]["Row"], "title"> | null;
  member_payments: Array<
    Pick<DBMemberPayment, "amount_paid" | "id" | "payment_method" | "recorded_at" | "reference_code">
  > | null;
};

type PaymentRegistrationResult = {
  memberId: string;
  membershipId: string;
  newBalance: number;
  payment: MemberPaymentDto;
  status: MembershipStatus;
};

function mapMemberPayment(
  payment: Pick<
    DBMemberPayment,
    "amount_paid" | "id" | "payment_method" | "recorded_at" | "reference_code"
  >,
): MemberPaymentDto {
  return {
    id: payment.id,
    amountPaid: Number(payment.amount_paid),
    paymentMethod: payment.payment_method,
    referenceCode: payment.reference_code,
    recordedAt: payment.recorded_at,
  };
}

function mapMembership(membership: MembershipWithRelations): MembershipDto {
  return {
    id: membership.id,
    planTitle: membership.membership_plans?.title ?? "Plan Personalizado",
    totalPrice: Number(membership.total_price),
    balanceDue: Number(membership.balance_due),
    status: membership.manual_activation_status,
    startDate: membership.start_date,
    endDate: membership.end_date,
    payments: (membership.member_payments ?? []).map(mapMemberPayment),
  };
}

function mapPerimeters(value: Json | null): Record<string, number> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (typeof entry === "number") {
        return [[key, entry]];
      }

      if (typeof entry === "string" && entry.trim()) {
        const parsed = Number(entry);

        return Number.isFinite(parsed) ? [[key, parsed]] : [];
      }

      return [];
    }),
  );
}

function mapMeasurement(measurement: DBMemberMeasurement): MemberMeasurementDto {
  return {
    id: measurement.id,
    weight: measurement.weight == null ? null : Number(measurement.weight),
    fatPercentage:
      measurement.fat_percentage == null ? null : Number(measurement.fat_percentage),
    perimeters: mapPerimeters(measurement.perimeters),
    recordedAt: measurement.recorded_at,
  };
}

function resolveUpdatedMembershipStatus(input: {
  currentStatus: MembershipStatus;
  newBalance: number;
}): MembershipStatus {
  if (input.newBalance === 0) {
    return "active";
  }

  if (input.currentStatus === "expired") {
    return "expired";
  }

  return "pending";
}

export async function getMemberFinancials(
  memberId: string,
  client: MemberFinanceClient = createSupabaseAdminClient(),
): Promise<MembershipDto | null> {
  const { data: membership, error } = await client
    .from("memberships")
    .select(
      `
      id,
      member_id,
      total_price,
      balance_due,
      manual_activation_status,
      start_date,
      end_date,
      membership_plans (title),
      member_payments (
        id,
        amount_paid,
        payment_method,
        reference_code,
        recorded_at
      )
    `,
    )
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !membership) {
    return null;
  }

  return mapMembership(membership as unknown as MembershipWithRelations);
}

export async function getMemberMeasurements(
  memberId: string,
  client: MemberFinanceClient = createSupabaseAdminClient(),
): Promise<MemberMeasurementDto[]> {
  const { data, error } = await client
    .from("member_measurements")
    .select("*")
    .eq("member_id", memberId)
    .order("recorded_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []).map((measurement) => mapMeasurement(measurement as DBMemberMeasurement));
}

export async function registerMemberPayment(
  input: MemberPaymentInput & { recordedByUserId?: string | null },
  client: MemberFinanceClient = createSupabaseAdminClient(),
): Promise<PaymentRegistrationResult> {
  const parsed = memberPaymentSchema.parse(input);
  const { data: membership, error: membershipError } = await client
    .from("memberships")
    .select("id, member_id, balance_due, total_price, manual_activation_status")
    .eq("id", parsed.membershipId)
    .single();

  if (membershipError || !membership) {
    throw new Error("No se encontro la membresia.");
  }

  const currentBalance = Number(membership.balance_due);
  const newBalance = Number(Math.max(0, currentBalance - parsed.amount).toFixed(2));
  const nextStatus = resolveUpdatedMembershipStatus({
    currentStatus: membership.manual_activation_status,
    newBalance,
  });

  const { data: payment, error: paymentError } = await client
    .from("member_payments")
    .insert({
      membership_id: parsed.membershipId,
      amount_paid: parsed.amount,
      payment_method: parsed.method,
      reference_code: parsed.reference ?? null,
      recorded_by: input.recordedByUserId ?? null,
    })
    .select("id, amount_paid, payment_method, reference_code, recorded_at")
    .single();

  if (paymentError || !payment) {
    throw new Error(`Error al registrar pago: ${paymentError?.message ?? "sin detalle"}`);
  }

  const { error: updateError } = await client
    .from("memberships")
    .update({
      balance_due: newBalance,
      manual_activation_status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.membershipId);

  if (updateError) {
    throw new Error(`Error al actualizar membresia: ${updateError.message}`);
  }

  return {
    memberId: membership.member_id,
    membershipId: membership.id,
    newBalance,
    payment: mapMemberPayment(payment as DBMemberPayment),
    status: nextStatus,
  };
}
