import { describe, expect, it } from "vitest";
import { deriveMembershipValidation } from "@/lib/memberships";

describe("membership permissive payments logic", () => {
  it("derives 'al_dia' status correctly even if overpaid", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2026-04-30",
      manualPaymentStatus: "overpaid",
      requestStatus: "active",
    });

    expect(validation.status).toBe("al_dia");
    expect(validation.tone).toBe("success");
  });

  it("keeps 'al_dia' status if membership is already active, even with partial payment", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2026-04-01",
      cycleEndsOn: "2026-04-30",
      manualPaymentStatus: "partial",
      requestStatus: "active",
    });

    expect(validation.status).toBe("al_dia");
    expect(validation.tone).toBe("success");
  });

  it("keeps 'al_dia' if active status is already granted even when cycle metadata ended", () => {
    const validation = deriveMembershipValidation({
      cycleStartsOn: "2026-03-01",
      cycleEndsOn: "2026-03-31",
      manualPaymentStatus: "paid",
      requestStatus: "active",
    });

    expect(validation.status).toBe("al_dia");
    expect(validation.tone).toBe("success");
  });
});
