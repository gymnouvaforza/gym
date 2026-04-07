import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/cart/checkout/paypal/complete/route";

describe("POST /api/cart/checkout/paypal/complete", () => {
  it("returns 410 because assisted reservation replaced the PayPal completion route", async () => {
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.error).toContain("PayPal ya no forma parte del storefront");
  });
});
