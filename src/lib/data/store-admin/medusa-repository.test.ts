import { describe, expect, it, vi } from "vitest";

import { normalizeStoreProductPayload, type StoreCategory } from "@/lib/data/store";
import { __medusaStoreAdminTestables } from "@/lib/data/store-admin/medusa-repository";

describe("medusa store admin repository mappers", () => {
  it("maps admin products to dashboard DTO preserving metadata fields", () => {
    const categories: StoreCategory[] = [
      {
        id: "pcat_root",
        slug: "accesorios",
        name: "Accesorios",
        order: 0,
        active: true,
      },
      {
        id: "pcat_child",
        slug: "straps",
        name: "Straps",
        parent_id: "pcat_root",
        order: 1,
        active: true,
      },
    ];

    const mapped = __medusaStoreAdminTestables.mapDashboardProductRecord(
      {
        id: "prod_1",
        title: "Straps Pro",
        handle: "straps-pro",
        description: "Descripcion larga",
        status: "published",
        categories: [{ id: "pcat_child" }],
        images: [{ url: "https://cdn.example.com/straps.png" }],
        variants: [
          {
            id: "variant_1",
            prices: [{ amount: 1599, currency_code: "pen" }],
            inventory_quantity: 2,
          },
        ],
        metadata: {
          category: "accesorios",
          short_description: "Descripcion corta",
          discount_label: "Oferta",
          stock_status: "low_stock",
          featured: true,
          pickup_only: false,
          pickup_note: "Recogida inmediata",
          pickup_summary: "Recogida",
          pickup_eta: "24h",
          tags: ["fuerza"],
          highlights: ["agarre firme"],
          benefits: ["mejor control"],
          usage_steps: ["ajustar y tirar"],
          specifications: [{ label: "Material", value: "Algodon" }],
          cta_label: "Reservar",
          order: 3,
          compare_price: 19.99,
          eyebrow: "Top",
        },
      },
      categories,
    );

    expect(mapped).not.toBeNull();
    expect(mapped?.id).toBe("prod_1");
    expect(mapped?.price).toBe(15.99);
    expect(mapped?.currency).toBe("PEN");
    expect(mapped?.category).toBe("accesorios");
    expect(mapped?.category_id).toBe("pcat_child");
    expect(mapped?.parent_category_name).toBe("Accesorios");
    expect(mapped?.stock_status).toBe("low_stock");
    expect(mapped?.tags).toEqual(["fuerza"]);
    expect(mapped?.images).toEqual(["https://cdn.example.com/straps.png"]);
  });

  it("translates medusa errors to UI-friendly spanish messages", () => {
    const unauthorized = __medusaStoreAdminTestables.translateMedusaError(
      { status: 401, message: "Unauthorized" },
      "fallback",
    );
    const duplicate = __medusaStoreAdminTestables.translateMedusaError(
      { status: 409, message: "duplicate handle" },
      "fallback",
    );

    expect(unauthorized.message).toContain("MEDUSA_ADMIN_API_KEY");
    expect(duplicate.message).toContain("slug");
  });

  it("normalizes product image URLs before sending them back to Medusa", () => {
    const payload = __medusaStoreAdminTestables.buildSharedProductPayload(
      normalizeStoreProductPayload({
        name: "Straps Pro",
        slug: "straps-pro",
        category_id: "pcat_child",
        eyebrow: "",
        short_description: "Descripcion corta",
        description: "Descripcion larga",
        price: 15.99,
        compare_price: "",
        discount_label: "",
        currency: "PEN",
        stock_status: "in_stock",
        featured: false,
        pickup_only: true,
        pickup_note: "",
        pickup_summary: "",
        pickup_eta: "",
        tags_text: "",
        highlights_text: "",
        benefits_text: "",
        usage_steps_text: "",
        images_text:
          "http://localhost:3000/images/products/straps.png\nnova-guantes.png",
        specifications_text: "",
        cta_label: "Reservar",
        order: 1,
        active: true,
      }),
      [
        {
          id: "pcat_child",
          slug: "accesorios",
          name: "Accesorios",
          order: 0,
          active: true,
        },
      ],
    );

    expect(payload.images).toEqual([
      { url: "/images/products/straps.png" },
      { url: "/images/products/nova-guantes.png" },
    ]);
    expect(payload.metadata.storefront_images).toEqual([
      "/images/products/straps.png",
      "/images/products/nova-guantes.png",
    ]);
  });

  it("includes the storefront sales channel in create and update payloads", () => {
    const normalized = normalizeStoreProductPayload({
      name: "Straps Pro",
      slug: "straps-pro",
      category_id: "pcat_child",
      eyebrow: "",
      short_description: "Descripcion corta",
      description: "Descripcion larga",
      price: 15.99,
      compare_price: "",
      discount_label: "",
      currency: "PEN",
      stock_status: "in_stock",
      featured: false,
      pickup_only: true,
      pickup_note: "",
      pickup_summary: "",
      pickup_eta: "",
      tags_text: "",
      highlights_text: "",
      benefits_text: "",
      usage_steps_text: "",
      images_text: "straps.png",
      specifications_text: "",
      cta_label: "Reservar",
      order: 1,
      active: true,
    });
    const categories = [
      {
        id: "pcat_child",
        slug: "accesorios",
        name: "Accesorios",
        order: 0,
        active: true,
      },
    ];

    const createPayload = __medusaStoreAdminTestables.buildCreateProductPayload(
      normalized,
      "sp_default",
      "sc_storefront",
      categories,
    );
    const updatePayload = __medusaStoreAdminTestables.buildUpdateProductPayload(
      normalized,
      "sc_storefront",
      categories,
    );

    expect(createPayload.sales_channels).toEqual([{ id: "sc_storefront" }]);
    expect(updatePayload.sales_channels).toEqual([{ id: "sc_storefront" }]);
  });

  it("syncs product-category links through the Medusa category endpoint", async () => {
    const updateProducts = vi.fn().mockResolvedValue(undefined);

    await __medusaStoreAdminTestables.syncProductCategoryAssignments(
      {
        admin: {
          productCategory: {
            updateProducts,
          },
        },
      } as never,
      "prod_123",
      "pcat_target",
      ["pcat_old", "pcat_target", "pcat_old"],
    );

    expect(updateProducts).toHaveBeenCalledTimes(1);
    expect(updateProducts).toHaveBeenCalledWith("pcat_old", { remove: ["prod_123"] });
  });

  it("adds the product to the selected category when it is not assigned yet", async () => {
    const updateProducts = vi.fn().mockResolvedValue(undefined);

    await __medusaStoreAdminTestables.syncProductCategoryAssignments(
      {
        admin: {
          productCategory: {
            updateProducts,
          },
        },
      } as never,
      "prod_123",
      "pcat_target",
      [],
    );

    expect(updateProducts).toHaveBeenCalledWith("pcat_target", { add: ["prod_123"] });
  });
});
