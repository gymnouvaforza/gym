// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import DashboardSidebar from "@/components/admin/DashboardSidebar";

const pathnameMock = vi.hoisted(() => ({ current: "/dashboard/mobile" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.current,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: ComponentProps<"img"> & { fill?: boolean }) => (
    <div data-testid="mock-image" data-alt={alt} />
  ),
}));

describe("DashboardSidebar", () => {
  it("renders Rutinas as a child link under App movil", () => {
    pathnameMock.current = "/dashboard/mobile";
    render(<DashboardSidebar />);

    const nav = screen.getByRole("navigation");
    const topLevelLabels = Array.from(nav.children).map((group) =>
      group.querySelector(":scope > a")?.textContent?.trim(),
    );

    expect(screen.getByTestId("mock-image")).toHaveAttribute("data-alt", "Nuova Forza Logo");
    expect(screen.getByRole("link", { name: /App movil/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Rutinas/i })).toBeInTheDocument();
    expect(topLevelLabels).toContain("App movil");
    expect(topLevelLabels).not.toContain("Rutinas");
    expect(screen.getByRole("link", { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tienda/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Campanas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Web$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ajustes avanzados/i })).toBeInTheDocument();
  });

  it("marks App movil as active on its own route", () => {
    pathnameMock.current = "/dashboard/mobile";
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /App movil/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Rutinas/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks App movil and Rutinas as active on routine routes", () => {
    pathnameMock.current = "/dashboard/rutinas/nueva";
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /App movil/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Rutinas/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
