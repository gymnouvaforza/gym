// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import ProductPurchasePanel from "@/components/cart/ProductPurchasePanel";
import type { Product } from "@/data/types";

const useCartMock = vi.fn();

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: () => useCartMock(),
}));

const product: Product = {
  id: "prod-preview",
  slug: "creatina-preview",
  name: "Creatina Preview",
  eyebrow: "Suplemento",
  category: "suplementos",
  short_description: "Descripcion corta de preview.",
  description: "Descripcion larga de preview para validar el panel de compra.",
  price: 39.9,
  paypal_price_usd: 10.8,
  compare_price: null,
  discount_label: undefined,
  currency: "PEN",
  stock_status: "in_stock",
  pickup_only: true,
  pickup_note: "Disponible en recepcion",
  pickup_summary: "Recogida en club",
  pickup_eta: "Listo hoy",
  featured: false,
  images: ["/images/products/product-1.png"],
  tags: ["Creatina"],
  highlights: ["5 g por toma"],
  benefits: ["Ayuda al rendimiento"],
  usage_steps: ["Mezcla con agua"],
  specifications: [{ label: "Peso", value: "300 g" }],
  options: [
    {
      id: "opt-size",
      title: "Tamano",
      values: ["300 g", "600 g"],
    },
  ],
  variants: [
    {
      id: "variant-1",
      title: "300 g",
      inventory_quantity: 6,
      price: 39.9,
      currency: "PEN",
      options: [{ option_id: "opt-size", option_title: "Tamano", value: "300 g" }],
    },
  ],
  cta_label: "Reservar",
  order: 1,
  active: true,
};

describe("ProductPurchasePanel", () => {
  beforeEach(() => {
    useCartMock.mockReset();
    useCartMock.mockReturnValue({
      addItem: vi.fn(),
      isBusy: false,
      error: null,
    });
  });

  it("renders a read-only purchase block in preview mode without touching the cart hook", () => {
    render(<ProductPurchasePanel product={product} previewMode />);

    expect(useCartMock).not.toHaveBeenCalled();
    expect(screen.getByText("Compra disponible en storefront")).toBeInTheDocument();
    expect(
      screen.getByText(/Esta ficha es solo una preview del dashboard/i),
    ).toBeInTheDocument();
  });
});
