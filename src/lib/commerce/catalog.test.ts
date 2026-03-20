import { afterEach, describe, expect, it, vi } from "vitest";

const medusaMocks = vi.hoisted(() => ({
  getMedusaCommerceProducts: vi.fn(),
  getMedusaCommerceProductBySlug: vi.fn(),
}));

vi.mock("@/lib/commerce/medusa", () => ({
  getMedusaCommerceProducts: medusaMocks.getMedusaCommerceProducts,
  getMedusaCommerceProductBySlug: medusaMocks.getMedusaCommerceProductBySlug,
}));

import { products as fixtureProducts } from "@/test/fixtures/products";

describe("commerce catalog", () => {
  afterEach(() => {
    vi.resetModules();
    medusaMocks.getMedusaCommerceProducts.mockReset();
    medusaMocks.getMedusaCommerceProductBySlug.mockReset();
  });

  it("returns a ready catalog when Medusa responds", async () => {
    const { getCommerceCatalog } = await import("@/lib/commerce/catalog");
    medusaMocks.getMedusaCommerceProducts.mockResolvedValueOnce(fixtureProducts.slice(0, 2));

    const snapshot = await getCommerceCatalog();

    expect(snapshot.status).toBe("ready");
    expect(snapshot.source).toBe("medusa");
    expect(snapshot.products).toHaveLength(2);
  });

  it("returns an unavailable catalog when Medusa fails", async () => {
    const { getCommerceCatalog } = await import("@/lib/commerce/catalog");
    medusaMocks.getMedusaCommerceProducts.mockRejectedValueOnce(new Error("Medusa down"));

    const snapshot = await getCommerceCatalog();

    expect(snapshot.status).toBe("unavailable");
    expect(snapshot.source).toBe("medusa");
    expect(snapshot.products).toEqual([]);
    expect(snapshot.warning).toContain("Medusa down");
  });

  it("distinguishes a product not found from an unavailable service", async () => {
    const { getCommerceProductBySlug } = await import("@/lib/commerce/catalog");
    medusaMocks.getMedusaCommerceProductBySlug
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error("timeout"));

    const missing = await getCommerceProductBySlug("sin-slug");
    const unavailable = await getCommerceProductBySlug("sin-red");

    expect(missing.status).toBe("not_found");
    expect(missing.product).toBeNull();
    expect(unavailable.status).toBe("unavailable");
    expect(unavailable.warning).toContain("timeout");
  });
});
