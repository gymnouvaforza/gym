// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { vi } from "vitest";

import SiteHeader from "@/components/marketing/SiteHeader";
import { defaultSiteSettings } from "@/lib/data/default-content";
import { normalizeSiteName } from "@/lib/seo";
import { CartProvider } from "@/features/checkout";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: ComponentProps<"img"> & { fill?: boolean; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : undefined} />
  ),
}));

vi.mock("@/components/cart/CartEntry", () => ({
  default: () => <button type="button">Abrir carrito</button>,
}));

vi.mock("@/components/marketing/SiteHeaderAuthActions", () => ({
  default: () => <div>Header auth actions</div>,
}));

describe("SiteHeader", () => {
  it("renders the site header shell with cart and auth actions", () => {
    render(
      <CartProvider>
        <SiteHeader settings={defaultSiteSettings} />
      </CartProvider>,
    );

    expect(
      screen.getByRole("link", { name: normalizeSiteName(defaultSiteSettings.site_name) }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Abrir carrito/i })).toBeInTheDocument();
    expect(screen.getAllByText("Header auth actions")).toHaveLength(2);
  });
});
