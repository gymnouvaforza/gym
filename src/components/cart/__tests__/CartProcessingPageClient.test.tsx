// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import CartProcessingPageClient from "@/components/cart/CartProcessingPageClient";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("CartProcessingPageClient", () => {
  it("explains that the legacy online checkout flow has been retired", () => {
    render(<CartProcessingPageClient cartId="cart_01" />);

    expect(screen.getByText(/Flujo retirado/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Esta pantalla ya no usa checkout online/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("cart_01")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al carrito" })).toHaveAttribute(
      "href",
      "/carrito",
    );
  });
});
