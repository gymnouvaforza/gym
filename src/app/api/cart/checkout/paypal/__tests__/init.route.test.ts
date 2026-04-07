import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/cart/checkout/paypal/init/route";

describe("POST /api/cart/checkout/paypal/init", () => {
  it("returns 410 because PayPal is no longer part of the storefront flow", async () => {
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.error).toContain("PayPal ya no forma parte del storefront");
  });
});
