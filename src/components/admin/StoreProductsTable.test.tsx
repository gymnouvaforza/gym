// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { vi } from "vitest";

import StoreProductsTable from "@/components/admin/StoreProductsTable";
import { products as fixtureProducts } from "@/test/fixtures/products";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("StoreProductsTable", () => {
  it("renders root and subcategory labels for product rows", () => {
    render(
      <StoreProductsTable
        products={[
          {
            ...fixtureProducts[0],
            category_id: "child-1",
            parent_category_name: "Suplementos",
            category_name: "Creatinas",
          },
        ]}
      />,
    );

    expect(screen.getByText("Creatina Monohidratada 300 g")).toBeInTheDocument();
    expect(screen.getByText("Suplementos / Creatinas")).toBeInTheDocument();
  });
});
