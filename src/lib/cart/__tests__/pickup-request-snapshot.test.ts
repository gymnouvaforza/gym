import { describe, expect, it, vi } from "vitest";

import {
  hydratePickupRequestFromCart,
  pickupSnapshotLooksBroken,
  repairPickupRequestSnapshot,
} from "@/lib/cart/pickup-request-snapshot";
import type { Cart, PickupRequestDetail } from "@/lib/cart/types";

function buildPickupRequest(
  overrides: Partial<PickupRequestDetail> = {},
): PickupRequestDetail {
  return {
    id: "pick_01",
    requestNumber: "NF-20260412-G7YT16",
    cartId: "cart_01",
    customerId: "cus_01",
    supabaseUserId: "user_01",
    email: "socio@gym.com",
    notes: "mensaje de prueba.",
    status: "requested",
    currencyCode: "PEN",
    itemCount: 5,
    subtotal: 0,
    total: 0,
    chargedCurrencyCode: "USD",
    chargedTotal: 33.65,
    exchangeRate: 3.7,
    exchangeRateSource: null,
    exchangeRateReference: null,
    source: "gym-storefront",
    orderId: null,
    paymentCollectionId: null,
    paymentProvider: "pp_paypal_payments",
    paymentStatus: "captured",
    paypalOrderId: "paypal_order_01",
    paypalCaptureId: "capture_01",
    paymentAuthorizedAt: null,
    paymentCapturedAt: "2026-04-12T21:06:00.000Z",
    emailStatus: "pending",
    emailSentAt: null,
    emailError: null,
    createdAt: "2026-04-12T21:06:00.000Z",
    updatedAt: "2026-04-12T21:06:00.000Z",
    lineItems: [
      {
        id: "line_01",
        title: "Creatina Monohidratada 300 g",
        quantity: 5,
        thumbnail: null,
        productId: "prod_01",
        productTitle: "Creatina Monohidratada 300 g",
        productHandle: "creatina-monohidratada-300g",
        variantId: "variant_01",
        variantTitle: "Default",
        variantSku: "CREATINA-300G",
        unitPrice: 0,
        total: 0,
        selectedOptions: [],
      },
    ],
    ...overrides,
  };
}

function buildCart(): Cart {
  return {
    id: "cart_01",
    email: "socio@gym.com",
    customerId: "cus_01",
    regionId: "reg_01",
    completedAt: "2026-04-12T21:06:00.000Z",
    metadata: null,
    paymentSession: null,
    items: [
      {
        id: "line_01",
        title: "Creatina Monohidratada 300 g",
        thumbnail: null,
        quantity: 5,
        productId: "prod_01",
        productTitle: "Creatina Monohidratada 300 g",
        productHandle: "creatina-monohidratada-300g",
        variantId: "variant_01",
        variantTitle: "Default",
        variantSku: "CREATINA-300G",
        unitPrice: 24.9,
        subtotal: 124.5,
        total: 124.5,
        currencyCode: "PEN",
        requiresShipping: false,
        selectedOptions: [],
      },
    ],
    summary: {
      currencyCode: "PEN",
      itemCount: 5,
      subtotal: 124.5,
      total: 124.5,
      taxTotal: 0,
      shippingTotal: 0,
      discountTotal: 0,
      requiresShipping: false,
      pickupRequestStatus: "submitted",
      pickupRequestedAt: "2026-04-12T21:06:00.000Z",
      pickupRequestId: "pick_01",
      pickupRequestNumber: "NF-20260412-G7YT16",
    },
  };
}

describe("pickup request snapshot repair", () => {
  it("detects broken pickup snapshots with items but zero totals", () => {
    expect(pickupSnapshotLooksBroken(buildPickupRequest())).toBe(true);
    expect(
      pickupSnapshotLooksBroken(buildPickupRequest({ subtotal: 124.5, total: 124.5, lineItems: [] })),
    ).toBe(false);
  });

  it("hydrates a broken pickup snapshot from the live cart", () => {
    const hydrated = hydratePickupRequestFromCart(buildPickupRequest(), buildCart());

    expect(hydrated.subtotal).toBe(124.5);
    expect(hydrated.total).toBe(124.5);
    expect(hydrated.lineItems[0]).toEqual(
      expect.objectContaining({
        quantity: 5,
        unitPrice: 24.9,
        total: 124.5,
      }),
    );
  });

  it("repairs the snapshot through order sync before falling back to the cart", async () => {
    const retrieveOrderByCartId = vi.fn().mockResolvedValue({ id: "order_01" });
    const syncPickupRequestFromOrder = vi.fn().mockResolvedValue(
      buildPickupRequest({
        orderId: "order_01",
        subtotal: 124.5,
        total: 124.5,
        lineItems: [
          {
            ...buildPickupRequest().lineItems[0]!,
            unitPrice: 24.9,
            total: 124.5,
          },
        ],
      }),
    );
    const retrieveCart = vi.fn().mockResolvedValue(buildCart());

    const result = await repairPickupRequestSnapshot(buildPickupRequest(), {
      retrieveOrderByCartId,
      syncPickupRequestFromOrder,
      retrieveCart,
    });

    expect(retrieveOrderByCartId).toHaveBeenCalledWith("cart_01");
    expect(syncPickupRequestFromOrder).toHaveBeenCalledWith("cart_01", "order_01");
    expect(retrieveCart).not.toHaveBeenCalled();
    expect(result.recoveredFromLiveCart).toBe(false);
    expect(result.pickupRequest.total).toBe(124.5);
    expect(result.pickupRequest.lineItems[0]?.unitPrice).toBe(24.9);
  });
});
