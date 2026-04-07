// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import DashboardNotice from "@/components/admin/DashboardNotice";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("DashboardNotice", () => {
  it("renders admin feedback with info semantics when using the old muted tone", () => {
    render(<DashboardNotice message="Supabase aun no esta listo." tone="muted" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("Supabase aun no esta listo.")).toBeInTheDocument();
  });

  it("supports an optional title and action", () => {
    render(
      <DashboardNotice
        tone="warning"
        title="Configuracion pendiente"
        message="Necesitas revisar las variables del entorno."
        actionLabel="Ir a ajustes"
        actionHref="/dashboard/info"
      />,
    );

    expect(screen.getByText("Configuracion pendiente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir a ajustes/i })).toHaveAttribute(
      "href",
      "/dashboard/info",
    );
  });
});
