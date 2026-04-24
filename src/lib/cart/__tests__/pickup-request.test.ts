import { describe, expect, it } from "vitest";

import {
  mapPickupRequest,
  normalizePickupRequestEmailStatus,
  normalizePickupRequestStatus,
} from "@/lib/cart/pickup-request";

describe("pickup request mapper", () => {
  it("normalizes statuses with safe defaults", () => {
    expect(normalizePickupRequestStatus("confirmed")).toBe("confirmed");
    expect(normalizePickupRequestStatus("unknown")).toBe("requested");
    expect(normalizePickupRequestEmailStatus("sent")).toBe("sent");
    expect(normalizePickupRequestEmailStatus("boom")).toBe("pending");
  });

  it("maps line items, totals and email fields from Medusa payloads", () => {
    const pickupRequest = mapPickupRequest({
      id: "pick_01",
      request_number: "NF-20260322-ABC123",
      cart_id: "cart_01",
      customer_id: "cus_01",
      supabase_user_id: "user_01",
      email: "socio@gym.com",
      notes: "Pasare por la tarde.",
      status: "ready_for_pickup",
      currency_code: "pen",
      item_count: "2",
      subtotal: "99.98",
      total: "99.98",
      charged_currency_code: "usd",
      charged_total: "29.6",
      exchange_rate: "3.377",
      exchange_rate_source: "BCRP PD04640PD",
      exchange_rate_reference: "19.Mar.26",
      source: "gym-storefront",
      email_status: "failed",
      email_sent_at: "2026-03-22T12:00:00.000Z",
      email_error: "SMTP timeout",
      created_at: "2026-03-22T10:00:00.000Z",
      updated_at: "2026-03-22T12:00:00.000Z",
      line_items_snapshot: [
        {
          id: "line_01",
          title: "Nova Whey",
          quantity: "2",
          unit_price: "49.99",
          total: "99.98",
          selected_options: [{ option_title: "Sabor", value: "Chocolate" }],
        },
      ],
    } as unknown as Parameters<typeof mapPickupRequest>[0]);

    expect(pickupRequest.requestNumber).toBe("NF-20260322-ABC123");
    expect(pickupRequest.status).toBe("ready_for_pickup");
    expect(pickupRequest.currencyCode).toBe("PEN");
    expect(pickupRequest.chargedCurrencyCode).toBe("USD");
    expect(pickupRequest.chargedTotal).toBe(29.6);
    expect(pickupRequest.exchangeRate).toBe(3.377);
    expect(pickupRequest.emailStatus).toBe("failed");
    expect(pickupRequest.emailError).toBe("SMTP timeout");
    expect(pickupRequest.lineItems).toEqual([
      expect.objectContaining({
        id: "line_01",
        title: "Nova Whey",
        quantity: 2,
        unitPrice: 49.99,
        total: 99.98,
        selectedOptions: [{ optionTitle: "Sabor", value: "Chocolate" }],
      }),
    ]);
  });

  it("normalizes localhost thumbnails so admin and member views can render them safely", () => {
    const pickupRequest = mapPickupRequest({
      id: "pick_02",
      request_number: "NF-20260407-RNSVVV",
      cart_id: "cart_02",
      email: "socio@gym.com",
      currency_code: "pen",
      item_count: 1,
      subtotal: "99.9",
      total: "99.9",
      email_status: "pending",
      source: "gym-storefront",
      created_at: "2026-04-07T10:00:00.000Z",
      updated_at: "2026-04-07T10:00:00.000Z",
      line_items_snapshot: [
        {
          id: "line_02",
          title: "Creatina",
          quantity: 1,
          thumbnail: "http://localhost:3000/images/products/nova-creatina.webp",
          unit_price: "99.9",
          total: "99.9",
          selected_options: [],
        },
      ],
    } as unknown as Parameters<typeof mapPickupRequest>[0]);

    expect(pickupRequest.lineItems[0]?.thumbnail).toBeTruthy();
    expect(pickupRequest.lineItems[0]?.thumbnail).not.toContain("localhost");
    expect(pickupRequest.lineItems[0]?.thumbnail).toContain("nova-creatina.webp");
  });
});
