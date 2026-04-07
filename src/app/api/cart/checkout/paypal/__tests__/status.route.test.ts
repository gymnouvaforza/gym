import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/cart/checkout/paypal/status/route";

describe("GET /api/cart/checkout/paypal/status", () => {
  it("returns 410 because the PayPal status poller is disabled", async () => {
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload).toEqual({
      status: "disabled",
      message:
        "PayPal ya no forma parte del storefront. Usa la reserva asistida del carrito y cierra la venta por WhatsApp con el equipo.",
    });
  });
});
