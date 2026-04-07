import { describe, expect, it } from "vitest";

import {
  applyManualPaymentSummaryToPickupRequest,
  getEffectivePickupRequestPaymentLabel,
  getEffectivePickupRequestPaymentStatus,
  type PickupRequestManualPaymentSummaryLike,
} from "@/lib/cart/pickup-request-payment";
import type { PickupRequestDetail } from "@/lib/cart/types";

function buildPickupRequest(
  overrides: Partial<PickupRequestDetail> = {},
): PickupRequestDetail {
  return {
    id: overrides.id ?? "pick_01",
    requestNumber: overrides.requestNumber ?? "NF-20260407-001",
    cartId: overrides.cartId ?? "cart_01",
    customerId: overrides.customerId ?? "cus_01",
    supabaseUserId: overrides.supabaseUserId ?? "user_01",
    email: overrides.email ?? "member@gym.com",
    notes: overrides.notes ?? null,
    status: overrides.status ?? "requested",
    currencyCode: overrides.currencyCode ?? "PEN",
    itemCount: overrides.itemCount ?? 1,
    subtotal: overrides.subtotal ?? 49.9,
    total: overrides.total ?? 49.9,
    chargedCurrencyCode: overrides.chargedCurrencyCode ?? null,
    chargedTotal: overrides.chargedTotal ?? null,
    exchangeRate: overrides.exchangeRate ?? null,
    exchangeRateSource: overrides.exchangeRateSource ?? null,
    exchangeRateReference: overrides.exchangeRateReference ?? null,
    source: overrides.source ?? "gym-storefront",
    orderId: overrides.orderId ?? "order_01",
    paymentCollectionId: overrides.paymentCollectionId ?? null,
    paymentProvider: overrides.paymentProvider ?? "manual",
    paymentStatus: overrides.paymentStatus ?? "pending",
    paypalOrderId: overrides.paypalOrderId ?? null,
    paypalCaptureId: overrides.paypalCaptureId ?? null,
    paymentAuthorizedAt: overrides.paymentAuthorizedAt ?? null,
    paymentCapturedAt: overrides.paymentCapturedAt ?? null,
    emailStatus: overrides.emailStatus ?? "pending",
    emailSentAt: overrides.emailSentAt ?? null,
    emailError: overrides.emailError ?? null,
    createdAt: overrides.createdAt ?? "2026-04-07T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-07T10:00:00.000Z",
    lineItems: overrides.lineItems ?? [],
  };
}

describe("pickup request manual payment helpers", () => {
  it("keeps the technical payment status when there is no manual movement", () => {
    expect(
      getEffectivePickupRequestPaymentStatus({
        paymentStatus: "error",
        manualPaymentStatus: "pending",
      }),
    ).toBe("error");
  });

  it("marks the payment as authorized when there is a partial manual payment", () => {
    expect(
      getEffectivePickupRequestPaymentStatus({
        paymentStatus: "pending",
        manualPaymentStatus: "partial",
      }),
    ).toBe("authorized");
  });

  it("marks the payment as captured when the manual ledger is fully paid or overpaid", () => {
    expect(
      getEffectivePickupRequestPaymentStatus({
        paymentStatus: "pending",
        manualPaymentStatus: "paid",
      }),
    ).toBe("captured");

    expect(
      getEffectivePickupRequestPaymentStatus({
        paymentStatus: "pending",
        manualPaymentStatus: "overpaid",
      }),
    ).toBe("captured");
  });

  it("returns a user-facing label aligned with the manual ledger", () => {
    expect(
      getEffectivePickupRequestPaymentLabel({
        paymentStatus: "pending",
        manualPaymentStatus: "partial",
        defaultLabel: "Pendiente",
      }),
    ).toBe("Pago parcial");

    expect(
      getEffectivePickupRequestPaymentLabel({
        paymentStatus: "pending",
        manualPaymentStatus: "paid",
        defaultLabel: "Pendiente",
      }),
    ).toBe("Pago completado");
  });

  it("applies the manual summary to the pickup request with the right effective dates", () => {
    const pickupRequest = buildPickupRequest({
      paymentStatus: "pending",
      paymentAuthorizedAt: null,
      paymentCapturedAt: null,
    });

    const partialSummary: PickupRequestManualPaymentSummaryLike = {
      status: "partial",
      updatedAt: "2026-04-07T11:00:00.000Z",
    };

    const paidSummary: PickupRequestManualPaymentSummaryLike = {
      status: "paid",
      updatedAt: "2026-04-07T12:00:00.000Z",
    };

    const partialResult = applyManualPaymentSummaryToPickupRequest(
      pickupRequest,
      partialSummary,
    );
    expect(partialResult.paymentStatus).toBe("authorized");
    expect(partialResult.paymentAuthorizedAt).toBe("2026-04-07T11:00:00.000Z");
    expect(partialResult.paymentCapturedAt).toBeNull();

    const paidResult = applyManualPaymentSummaryToPickupRequest(pickupRequest, paidSummary);
    expect(paidResult.paymentStatus).toBe("captured");
    expect(paidResult.paymentCapturedAt).toBe("2026-04-07T12:00:00.000Z");
  });

  it("preserves existing technical dates when the manual summary has no timestamp", () => {
    const pickupRequest = buildPickupRequest({
      paymentStatus: "captured",
      paymentCapturedAt: "2026-04-07T09:30:00.000Z",
    });

    const result = applyManualPaymentSummaryToPickupRequest(pickupRequest, {
      status: "paid",
      updatedAt: null,
    });

    expect(result.paymentCapturedAt).toBe("2026-04-07T09:30:00.000Z");
  });
});
