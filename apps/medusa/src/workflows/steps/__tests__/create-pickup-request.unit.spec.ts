import { __createPickupRequestStepTestables } from "../create-pickup-request"

describe("create pickup request helpers", () => {
  it("parses numeric strings before normalizing money amounts", () => {
    expect(__createPickupRequestStepTestables.asNumber("9990")).toBe(9990)
    expect(__createPickupRequestStepTestables.normalizeMoneyAmount("9990")).toBe(99.9)
  })

  it("maps line item snapshots with string prices coming from Medusa", () => {
    const lineItem = __createPickupRequestStepTestables.mapLineItemSnapshot({
      id: "cali_01",
      title: "Creatina Monohidratada 300 g",
      quantity: 2,
      thumbnail: "http://localhost:3000/images/products/nova-creatina.webp",
      product_id: "prod_01",
      product_title: "Creatina Monohidratada 300 g",
      product_handle: "creatina-monohidratada-300g",
      variant_id: "variant_01",
      variant_title: "Default",
      variant_sku: "SB-CREATINA-MONOHIDRATADA-300G",
      unit_price: "9990",
      total: "19980",
      variant_option_values: {
        Formato: "300 g",
      },
    })

    expect(lineItem).toEqual({
      id: "cali_01",
      title: "Creatina Monohidratada 300 g",
      quantity: 2,
      thumbnail: "http://localhost:3000/images/products/nova-creatina.webp",
      product_id: "prod_01",
      product_title: "Creatina Monohidratada 300 g",
      product_handle: "creatina-monohidratada-300g",
      variant_id: "variant_01",
      variant_title: "Default",
      variant_sku: "SB-CREATINA-MONOHIDRATADA-300G",
      unit_price: 99.9,
      total: 199.8,
      selected_options: [
        {
          option_title: "Formato",
          value: "300 g",
        },
      ],
    })
  })

  it("falls back to subtotal when Medusa omits line total fields", () => {
    const lineItem = __createPickupRequestStepTestables.mapLineItemSnapshot({
      id: "cali_02",
      title: "Creatina Monohidratada 300 g",
      quantity: 5,
      unit_price: "2490",
      subtotal: "12450",
      total: null,
    })

    expect(lineItem.unit_price).toBe(24.9)
    expect(lineItem.total).toBe(124.5)
  })

  it("prefers cart totals but can rebuild them from the line snapshot", () => {
    const totals = __createPickupRequestStepTestables.resolvePickupRequestTotals(
      {
        subtotal: null,
        total: null,
      },
      [
        {
          id: "line_01",
          title: "Creatina",
          quantity: 5,
          thumbnail: null,
          product_id: null,
          product_title: null,
          product_handle: null,
          variant_id: null,
          variant_title: null,
          variant_sku: null,
          unit_price: 24.9,
          total: 124.5,
          selected_options: [],
        },
      ],
    )

    expect(totals).toEqual({
      subtotal: 124.5,
      total: 124.5,
    })
  })
})
