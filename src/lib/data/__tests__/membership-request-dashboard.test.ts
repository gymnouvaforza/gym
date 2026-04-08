import { describe, expect, it } from "vitest";

import {
  filterAndSortMembershipRequests,
  getMembershipRequestAttentionBucket,
  parseMembershipRequestFilters,
  summarizeMembershipRequests,
} from "@/lib/data/membership-request-dashboard";
import type { MembershipRequestDetail } from "@/lib/memberships";

function buildRequest(
  overrides: Partial<MembershipRequestDetail>,
): MembershipRequestDetail {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    requestNumber: overrides.requestNumber ?? "MEM-20260408-AAAAAA",
    email: overrides.email ?? "socio@example.com",
    supabaseUserId: overrides.supabaseUserId ?? "user_1",
    status: overrides.status ?? "requested",
    source: overrides.source ?? "member-portal",
    notes: overrides.notes ?? null,
    createdAt: overrides.createdAt ?? "2026-04-08T18:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-08T18:00:00.000Z",
    activatedAt: overrides.activatedAt ?? null,
    emailStatus: overrides.emailStatus ?? "pending",
    emailSentAt: overrides.emailSentAt ?? null,
    emailError: overrides.emailError ?? null,
    cycleStartsOn: overrides.cycleStartsOn ?? "2026-04-08",
    cycleEndsOn: overrides.cycleEndsOn ?? "2026-05-07",
    billingLabel: overrides.billingLabel ?? "30 dias",
    currencyCode: overrides.currencyCode ?? "PEN",
    durationDays: overrides.durationDays ?? 30,
    priceAmount: overrides.priceAmount ?? 120,
    planTitleSnapshot: overrides.planTitleSnapshot ?? "Membresia Base",
    renewsFromRequestId: overrides.renewsFromRequestId ?? null,
    commerce:
      overrides.commerce ?? {
        cartId: null,
        orderId: null,
        productId: null,
        syncError: null,
        syncStatus: "pending",
        syncedAt: null,
        variantId: null,
      },
    member:
      overrides.member ??
      {
        id: "member_1",
        memberNumber: "NF-123",
        fullName: "Socio Titan",
        email: "socio@example.com",
        phone: null,
        status: "active",
        branchName: "Club Central",
        supabaseUserId: "user_1",
        trainerUserId: null,
        trainerName: null,
        trainingPlanLabel: null,
        membershipQrToken: crypto.randomUUID(),
      },
    plan:
      overrides.plan ??
      {
        id: "plan_1",
        slug: "base-30d",
        title: "Membresia Base",
        description: null,
        price_amount: 120,
        currency_code: "PEN",
        billing_label: "30 dias",
        duration_days: 30,
        is_active: true,
        is_featured: false,
        medusa_product_id: null,
        medusa_sync_error: null,
        medusa_sync_status: "pending",
        medusa_synced_at: null,
        medusa_variant_id: null,
        notes: null,
        sort_order: 10,
        created_at: "2026-04-08T18:00:00.000Z",
        updated_at: "2026-04-08T18:00:00.000Z",
      },
    manualPaymentSummary:
      overrides.manualPaymentSummary ??
      {
        paidTotal: 0,
        balanceDue: 120,
        status: "pending",
        entryCount: 0,
        updatedAt: null,
      },
    validation:
      overrides.validation ??
      {
        status: "pendiente",
        label: "Pago o activacion pendiente",
        tone: "default",
        cycleStartsOn: "2026-04-08",
        cycleEndsOn: "2026-05-07",
      },
  };
}

describe("membership request dashboard helpers", () => {
  it("parses date and status filters from query params", () => {
    const filters = parseMembershipRequestFilters({
      status: "active",
      dateFrom: "2026-04-01",
      dateTo: "2026-04-30",
      q: "Titan",
    });

    expect(filters.status).toBe("active");
    expect(filters.dateFrom).toBe("2026-04-01");
    expect(filters.q).toBe("Titan");
  });

  it("classifies active and expired buckets correctly", () => {
    expect(
      getMembershipRequestAttentionBucket(
        buildRequest({
          status: "active",
          validation: {
            status: "al_dia",
            label: "Membresia al dia",
            tone: "success",
            cycleStartsOn: "2026-04-08",
            cycleEndsOn: "2026-05-07",
          },
        }),
      ),
    ).toBe("active");

    expect(
      getMembershipRequestAttentionBucket(
        buildRequest({
          status: "expired",
          validation: {
            status: "vencido",
            label: "Ciclo vencido",
            tone: "warning",
            cycleStartsOn: "2026-03-01",
            cycleEndsOn: "2026-03-31",
          },
        }),
      ),
    ).toBe("expired");
  });

  it("marks sync errors as action required", () => {
    expect(
      getMembershipRequestAttentionBucket(
        buildRequest({
          commerce: {
            cartId: null,
            orderId: null,
            productId: "prod_membership",
            syncError: "Medusa timeout",
            syncStatus: "error",
            syncedAt: "2026-04-08T18:20:00.000Z",
            variantId: "variant_membership",
          },
        }),
      ),
    ).toBe("action_required");
  });

  it("filters by text and sorts by updated desc by default", () => {
    const filtered = filterAndSortMembershipRequests(
      [
        buildRequest({
          requestNumber: "MEM-20260408-BBBB",
          member: {
            ...buildRequest({}).member,
            fullName: "Cliente Zeta",
          },
          updatedAt: "2026-04-08T20:00:00.000Z",
        }),
        buildRequest({
          requestNumber: "MEM-20260408-AAAA",
          member: {
            ...buildRequest({}).member,
            fullName: "Socio Titan",
          },
          updatedAt: "2026-04-08T21:00:00.000Z",
        }),
      ],
      {
        q: "Titan",
        status: "all",
        attention: "all",
        dateFrom: "",
        dateTo: "",
        sort: "updated_desc",
      },
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.member.fullName).toBe("Socio Titan");
  });

  it("summarizes request buckets", () => {
    const summary = summarizeMembershipRequests([
      buildRequest({
        status: "active",
        validation: {
          status: "al_dia",
          label: "Membresia al dia",
          tone: "success",
          cycleStartsOn: "2026-04-08",
          cycleEndsOn: "2026-05-07",
        },
      }),
      buildRequest({
        manualPaymentSummary: {
          paidTotal: 20,
          balanceDue: 100,
          status: "partial",
          entryCount: 1,
          updatedAt: "2026-04-08T18:30:00.000Z",
        },
      }),
      buildRequest({
        status: "expired",
        validation: {
          status: "vencido",
          label: "Ciclo vencido",
          tone: "warning",
          cycleStartsOn: "2026-03-01",
          cycleEndsOn: "2026-03-31",
        },
      }),
    ]);

    expect(summary).toEqual({
      total: 3,
      active: 1,
      actionRequired: 0,
      expired: 1,
      pendingPayment: 1,
    });
  });
});
