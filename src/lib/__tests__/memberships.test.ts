import { describe, expect, it } from "vitest";

import {
  deriveMembershipValidation,
  mapMembershipManualPaymentSummary,
} from "@/lib/memberships";

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

  it("marks a membership as vencido when the cycle is already past", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2025-01-01",
      cycleEndsOn: "2025-01-31",
      manualPaymentStatus: "paid",
      requestStatus: "active",
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
