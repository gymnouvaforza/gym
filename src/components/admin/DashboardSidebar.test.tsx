// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import DashboardSidebar from "@/components/admin/DashboardSidebar";

const pathnameMock = vi.hoisted(() => ({ current: "/dashboard/mobile" }));
const searchParamsMock = vi.hoisted(() => ({ current: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock.current,
  useSearchParams: () => new URLSearchParams(searchParamsMock.current),
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
  function setHash(hash: string) {
    window.location.hash = hash;
  }

  function setSearch(search: string) {
    searchParamsMock.current = search;
  }

  it("renders Rutinas as a child link under App movil", () => {
    pathnameMock.current = "/dashboard/mobile";
    setSearch("");
    setHash("");
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
    expect(screen.getByRole("link", { name: /Consultas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Web$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ajustes avanzados/i })).toBeInTheDocument();
  });

  it("renders Entrenadores as a child link under Datos del gym", () => {
    pathnameMock.current = "/dashboard/info";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    const nav = screen.getByRole("navigation");
    const topLevelLabels = Array.from(nav.children).map((group) =>
      group.querySelector(":scope > a")?.textContent?.trim(),
    );

    expect(screen.getByRole("link", { name: /Datos del gym/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Entrenadores/i })).toBeInTheDocument();
    expect(topLevelLabels).toContain("Datos del gym");
    expect(topLevelLabels).not.toContain("Entrenadores");
  });

  it("renders Planes and Moderacion resenas as child links under Campanas", () => {
    pathnameMock.current = "/dashboard/marketing";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    const nav = screen.getByRole("navigation");
    const topLevelLabels = Array.from(nav.children).map((group) =>
      group.querySelector(":scope > a")?.textContent?.trim(),
    );

    expect(screen.getByRole("link", { name: /Campanas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Planes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Moderacion resenas/i })).toBeInTheDocument();
    expect(topLevelLabels).toContain("Campanas");
    expect(topLevelLabels).not.toContain("Planes");
  });

  it("renders task-level children for Consultas, Socios, Web, CMS and Ajustes avanzados", () => {
    pathnameMock.current = "/dashboard/leads";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /Filtros/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Bandeja/i })).toBeInTheDocument();

    pathnameMock.current = "/dashboard/miembros";
    setSearch("");
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /Listado/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nuevo socio/i })).toBeInTheDocument();

    pathnameMock.current = "/dashboard/web";
    setSearch("");
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /^Secciones$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Exploracion/i })).toBeInTheDocument();

    pathnameMock.current = "/dashboard/cms";
    setSearch("");
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /Documentos/i })).toBeInTheDocument();

    pathnameMock.current = "/dashboard/advanced";
    setSearch("");
    render(<DashboardSidebar />);
    expect(screen.getByRole("link", { name: /Configuracion/i })).toBeInTheDocument();
  });

  it("renders route-level children for Tienda", () => {
    pathnameMock.current = "/dashboard/tienda";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /^Resumen$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Productos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Categorias/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Pedidos/i })).toBeInTheDocument();
  });

  it("marks App movil as active on its own route", () => {
    pathnameMock.current = "/dashboard/mobile";
    setSearch("");
    setHash("");
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
    setSearch("");
    setHash("");
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

  it("marks Datos del gym and Entrenadores as active on the marketing trainers section route", () => {
    pathnameMock.current = "/dashboard/info/entrenadores";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /Datos del gym/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Entrenadores/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks Campanas and Planes as active on the marketing plans section route", () => {
    pathnameMock.current = "/dashboard/marketing/planes";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /Campanas/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /^Planes$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Moderacion resenas/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Campanas and Moderacion resenas as active on the marketing reviews section route", () => {
    pathnameMock.current = "/dashboard/marketing";
    setSearch("");
    setHash("");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /Campanas/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Moderacion resenas/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /^Planes$/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Consultas and Bandeja as active on the queue section route", () => {
    pathnameMock.current = "/dashboard/leads";
    setSearch("");
    setHash("#bandeja");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /Consultas/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /^Bandeja$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks Web and Exploracion as active on the visual exploration route", () => {
    pathnameMock.current = "/dashboard/web";
    setSearch("");
    setHash("#exploracion");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /^Web$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Exploracion/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks App movil and Entrenadores as active on the trainer segment route", () => {
    pathnameMock.current = "/dashboard/mobile";
    setSearch("segment=trainer");
    setHash("");
    render(<DashboardSidebar />);

    expect(screen.getByRole("link", { name: /App movil/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Entrenadores/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /Superadmins/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
