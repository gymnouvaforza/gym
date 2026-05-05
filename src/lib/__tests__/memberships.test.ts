import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMembershipRequest,
  resolveCycleWindow,
} from "@/lib/data/memberships";
import {
  deriveMembershipValidation,
  mapMembershipManualPaymentSummary,
} from "@/lib/memberships";

const supabaseServerMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: supabaseServerMocks.createSupabaseAdminClient,
}));

function createMembershipRequestClientMock(options: { activeRequest: boolean }) {
  const memberRow = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "member@example.com",
    status: "active",
    supabase_user_id: "22222222-2222-2222-2222-222222222222",
    member_number: "MF-001",
    full_name: "Socio Demo",
    phone: null,
    branch_name: null,
    trainer_user_id: null,
    training_plan_label: null,
    membership_qr_token: "qr-token",
  };

  const planRow = {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Plan 30",
    description: null,
    price_amount: 120,
    currency_code: "PEN",
    billing_label: "30 dias",
    duration_days: 30,
    is_active: true,
    is_featured: false,
    sort_order: 1,
    notes: null,
    medusa_product_id: null,
    medusa_variant_id: null,
    medusa_sync_status: "pending",
    medusa_sync_error: null,
    medusa_synced_at: null,
    created_at: "2026-04-08T08:00:00.000Z",
    updated_at: "2026-04-08T08:00:00.000Z",
    code: "PM-30D",
    is_freezable: true,
    max_freeze_days: 15,
    bonus_days: 2,
  };

  const query = {
    eq: vi.fn(() => query),
    limit: vi.fn(() => query),
    order: vi.fn(() => query),
    select: vi.fn(() => query),
    maybeSingleCallCount: 0,
    maybeSingle: vi.fn(async () => {
      const call = query.maybeSingleCallCount;
      query.maybeSingleCallCount += 1;

      if (call === 0) {
        return { data: memberRow, error: null };
      }

      if (call === 1) {
        return { data: planRow, error: null };
      }

      if (call === 2) {
        return { data: null, error: null };
      }

      return {
        data: options.activeRequest ? { id: "44444444-4444-4444-4444-444444444444" } : null,
        error: null,
      };
    }),
  };

  return {
    client: {
      from: vi.fn(() => query),
    },
  };
}

describe("membership request cycle window", () => {
  it("keeps the base 30 day window inclusive", () => {
    expect(
      // start + 29 days
      resolveCycleWindow({
        durationDays: 30,
        cycleStartsOn: "2026-04-01",
      }),
    ).toEqual({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2026-04-30",
    });
  });

  it("adds bonus days to a 30 day plan", () => {
    expect(
      resolveCycleWindow({
        durationDays: 30,
        bonusDays: 2,
        cycleStartsOn: "2026-04-01",
      }),
    ).toEqual({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2026-05-02",
    });
  });

  it("adds long bonus periods to a 90 day plan", () => {
    expect(
      resolveCycleWindow({
        durationDays: 90,
        bonusDays: 30,
        cycleStartsOn: "2026-04-01",
      }),
    ).toEqual({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2026-07-29",
    });
  });
});

describe("createMembershipRequest guardrails", () => {
  beforeEach(() => {
    supabaseServerMocks.createSupabaseAdminClient.mockReset();
  });

  it("rejects a second active membership for the same member", async () => {
    const mocked = createMembershipRequestClientMock({ activeRequest: true });
    supabaseServerMocks.createSupabaseAdminClient.mockReturnValue(mocked.client);

    await expect(
      createMembershipRequest({
        memberId: "11111111-1111-4111-8111-111111111111",
        membershipPlanId: "33333333-3333-4333-8333-333333333333",
      }),
    ).rejects.toThrow("membresia activa");
  });
});

describe("memberships helpers", () => {
  it("marks a membership as al_dia when payment is complete and the cycle is current", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2099-04-30",
      manualPaymentStatus: "paid",
      requestStatus: "active",
    });

    expect(validation.status).toBe("al_dia");
    expect(validation.tone).toBe("success");
  });

  it("marks a membership as pendiente when payment is partial", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2099-04-30",
      manualPaymentStatus: "partial",
      requestStatus: "confirmed",
    });

    expect(validation.status).toBe("pendiente");
    expect(validation.tone).toBe("warning");
  });

  it("marks a membership as vencido when the cycle is already past and not active", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2025-01-01",
      cycleEndsOn: "2025-01-31",
      manualPaymentStatus: "paid",
      requestStatus: "confirmed",
    });

    expect(validation.status).toBe("vencido");
  });

  it("normalizes manual payment summary rows", () => {
    const summary = mapMembershipManualPaymentSummary({
      manual_paid_total: 80,
      manual_balance_due: 40,
      manual_payment_status: "partial",
      manual_payment_entry_count: 2,
      manual_payment_updated_at: "2026-04-08T18:30:00.000Z",
    });

    expect(summary).toEqual({
      paidTotal: 80,
      balanceDue: 40,
      status: "partial",
      entryCount: 2,
      updatedAt: "2026-04-08T18:30:00.000Z",
    });
  });
});
