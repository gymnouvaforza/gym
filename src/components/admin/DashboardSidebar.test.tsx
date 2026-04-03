// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import DashboardSidebar from "@/components/admin/DashboardSidebar";

const pathnameMock = vi.hoisted(() => ({ current: "/dashboard/tienda" }));

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

describe("DashboardSidebar", () => {
  it("renders Rutinas as a child link under App Mobile", () => {
    pathnameMock.current = "/dashboard/tienda";
    render(<DashboardSidebar />);

    const nav = screen.getByRole("navigation");
    const topLevelLabels = Array.from(nav.children).map((group) =>
      group.querySelector(":scope > a")?.textContent?.trim(),
    );

    expect(screen.getByText("Titan Gym")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /App Mobile/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Rutinas/i })).toBeInTheDocument();
    expect(topLevelLabels).toContain("App Mobile");
    expect(topLevelLabels).not.toContain("Rutinas");
    expect(screen.getByRole("link", { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tienda/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Marketing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Diseno Web/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ajustes Internos/i })).toBeInTheDocument();
  });

  it("marks App Mobile as active on its own route", () => {
    pathnameMock.current = "/dashboard/mobile";
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /App Mobile/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Rutinas/i })).not.toHaveAttribute("aria-current");
  });

  it("marks App Mobile and Rutinas as active on routines routes", () => {
    pathnameMock.current = "/dashboard/rutinas/nueva";
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /App Mobile/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Rutinas/i })).toHaveAttribute("aria-current", "page");
  });
});
