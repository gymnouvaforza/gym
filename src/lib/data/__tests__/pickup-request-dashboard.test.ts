import { describe, expect, it } from "vitest";

import type { PickupRequestDetail } from "@/lib/cart/types";
import {
  buildPickupRequestTimeline,
  DEFAULT_PICKUP_REQUEST_FILTERS,
  filterAndSortPickupRequests,
  getPickupRequestOperationalHint,
  hasActivePickupRequestFilters,
  parsePickupRequestFilters,
  summarizePickupRequests,
} from "@/lib/data/pickup-request-dashboard";

function buildPickupRequest(
  overrides: Partial<PickupRequestDetail> = {},
): PickupRequestDetail {
  return {
    id: overrides.id ?? "pick_01",
    requestNumber: overrides.requestNumber ?? "NF-20260330-001",
    cartId: overrides.cartId ?? "cart_01",
    customerId: overrides.customerId ?? "cus_01",
    supabaseUserId: overrides.supabaseUserId ?? "user_01",
    email: overrides.email ?? "member@gym.com",
    notes: overrides.notes ?? null,
    status: overrides.status ?? "requested",
    currencyCode: overrides.currencyCode ?? "PEN",
    itemCount: overrides.itemCount ?? 1,
    subtotal: overrides.subtotal ?? 39.9,
    total: overrides.total ?? 39.9,
    chargedCurrencyCode: overrides.chargedCurrencyCode ?? "USD",
    chargedTotal: overrides.chargedTotal ?? 11.8,
    exchangeRate: overrides.exchangeRate ?? 3.38,
    exchangeRateSource: overrides.exchangeRateSource ?? "manual",
    exchangeRateReference: overrides.exchangeRateReference ?? "30.Mar.26",
    source: overrides.source ?? "gym-storefront",
    orderId: overrides.orderId ?? "order_01",
    paymentCollectionId: overrides.paymentCollectionId ?? null,
    paymentProvider: overrides.paymentProvider ?? "paypal",
    paymentStatus: overrides.paymentStatus ?? "captured",
    paypalOrderId: overrides.paypalOrderId ?? "paypal_01",
    paypalCaptureId: overrides.paypalCaptureId ?? "cap_01",
    paymentAuthorizedAt: overrides.paymentAuthorizedAt ?? "2026-03-30T08:30:00.000Z",
    paymentCapturedAt: overrides.paymentCapturedAt ?? "2026-03-30T08:32:00.000Z",
    emailStatus: overrides.emailStatus ?? "sent",
    emailSentAt: overrides.emailSentAt ?? "2026-03-30T08:35:00.000Z",
    emailError: overrides.emailError ?? null,
    createdAt: overrides.createdAt ?? "2026-03-30T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-30T08:40:00.000Z",
    lineItems: overrides.lineItems ?? [],
  };
}

describe("pickup request dashboard helpers", () => {
  it("parses known filters and falls back for invalid params", () => {
    expect(
      parsePickupRequestFilters({
        q: "  order_01 ",
        status: "confirmed",
        paymentStatus: "captured",
        emailStatus: "failed",
        attention: "action_required",
        dateFrom: "2026-03-01",
        dateTo: "2026-03-31",
        sort: "created_asc",
      }),
    ).toEqual({
      q: "order_01",
      status: "confirmed",
      paymentStatus: "captured",
      emailStatus: "failed",
      attention: "action_required",
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
      sort: "created_asc",
    });

    expect(
      parsePickupRequestFilters({
        status: "unknown",
        paymentStatus: "boom",
        emailStatus: "bad",
        attention: "later",
        dateFrom: "bad-date",
        dateTo: "2026-99-99",
        sort: "random",
      }),
    ).toEqual(DEFAULT_PICKUP_REQUEST_FILTERS);
  });

  it("filters by text, status, delivery signals and sorts by recency", () => {
    const pickupRequests = [
      buildPickupRequest({
        id: "pick_requested",
        requestNumber: "NF-REQ",
        status: "requested",
        paymentStatus: "captured",
        emailStatus: "pending",
        updatedAt: "2026-03-30T09:00:00.000Z",
      }),
      buildPickupRequest({
        id: "pick_ready",
        requestNumber: "NF-READY",
        status: "ready_for_pickup",
        updatedAt: "2026-03-30T10:00:00.000Z",
      }),
      buildPickupRequest({
        id: "pick_error",
        requestNumber: "NF-ERR",
        paymentStatus: "error",
        emailStatus: "failed",
        emailError: "SMTP timeout",
        updatedAt: "2026-03-30T11:00:00.000Z",
      }),
    ];

    expect(
      filterAndSortPickupRequests(pickupRequests, {
        ...DEFAULT_PICKUP_REQUEST_FILTERS,
        attention: "action_required",
      }).map((pickupRequest) => pickupRequest.id),
    ).toEqual(["pick_error"]);

    expect(
      filterAndSortPickupRequests(pickupRequests, {
        ...DEFAULT_PICKUP_REQUEST_FILTERS,
        q: "nf",
      }).map((pickupRequest) => pickupRequest.id),
    ).toEqual(["pick_error", "pick_ready", "pick_requested"]);

    expect(
      filterAndSortPickupRequests(pickupRequests, {
        ...DEFAULT_PICKUP_REQUEST_FILTERS,
        emailStatus: "pending",
        sort: "created_desc",
      }).map((pickupRequest) => pickupRequest.id),
    ).toEqual(["pick_requested"]);

    expect(
      filterAndSortPickupRequests(pickupRequests, {
        ...DEFAULT_PICKUP_REQUEST_FILTERS,
        dateFrom: "2026-03-30",
        dateTo: "2026-03-30",
      }).map((pickupRequest) => pickupRequest.id),
    ).toEqual(["pick_error", "pick_ready", "pick_requested"]);

    expect(
      filterAndSortPickupRequests(
        [
          ...pickupRequests,
          buildPickupRequest({
            id: "pick_old",
            requestNumber: "NF-OLD",
            createdAt: "2026-03-20T10:00:00.000Z",
            updatedAt: "2026-03-20T10:00:00.000Z",
          }),
        ],
        {
          ...DEFAULT_PICKUP_REQUEST_FILTERS,
          dateFrom: "2026-03-25",
        },
      ).map((pickupRequest) => pickupRequest.id),
    ).not.toContain("pick_old");
  });

  it("builds summary, hints and timeline from operational state", () => {
    const pickupRequests = [
      buildPickupRequest({
        id: "pick_requested",
        status: "requested",
        paymentStatus: "captured",
        emailStatus: "pending",
      }),
      buildPickupRequest({
        id: "pick_ready",
        status: "ready_for_pickup",
      }),
      buildPickupRequest({
        id: "pick_fulfilled",
        status: "fulfilled",
      }),
      buildPickupRequest({
        id: "pick_issue",
        paymentStatus: "requires_more",
        emailStatus: "failed",
        emailError: "SMTP timeout",
      }),
    ];

    expect(summarizePickupRequests(pickupRequests)).toEqual({
      total: 4,
      inProgress: 1,
      readyNow: 1,
      actionRequired: 1,
      fulfilled: 1,
    });

    expect(hasActivePickupRequestFilters(DEFAULT_PICKUP_REQUEST_FILTERS)).toBe(false);
    expect(
      hasActivePickupRequestFilters({
        ...DEFAULT_PICKUP_REQUEST_FILTERS,
        attention: "ready_now",
      }),
    ).toBe(true);
    expect(
      hasActivePickupRequestFilters({
        ...DEFAULT_PICKUP_REQUEST_FILTERS,
        dateFrom: "2026-03-01",
      }),
    ).toBe(true);

    expect(getPickupRequestOperationalHint(pickupRequests[3])).toEqual({
      label: "Reintentar email",
      description:
        "El ultimo envio fallo. Revisa el error registrado y vuelve a lanzar la notificacion al cliente.",
      tone: "warning",
    });

    expect(buildPickupRequestTimeline(pickupRequests[3])).toEqual([
      expect.objectContaining({
        key: "request",
        state: "completed",
      }),
      expect.objectContaining({
        key: "payment",
        state: "warning",
      }),
      expect.objectContaining({
        key: "email",
        state: "warning",
        description: "SMTP timeout",
      }),
      expect.objectContaining({
        key: "pickup",
        state: "pending",
      }),
    ]);
  });
});
