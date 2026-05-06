// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pageMocks = vi.hoisted(() => ({
  listDashboardMembers: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/data/gym-management", () => ({
  listDashboardMembers: pageMocks.listDashboardMembers,
}));

vi.mock("@/components/admin/DashboardPageHeader", () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));

vi.mock("@/components/admin/MembersTable", () => ({
  default: ({ initialMembers }: { initialMembers: Array<{ id: string }> }) => (
    <div data-testid="members-table">{initialMembers.length}</div>
  ),
}));

vi.mock("@/components/ui/loading-state", () => ({
  MembersTableSkeleton: () => <div data-testid="members-skeleton" />,
}));

vi.mock("@/components/system/nf-card", () => ({
  NFCard: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe("dashboard members page", () => {
  beforeEach(() => {
    pageMocks.listDashboardMembers.mockReset();
    pageMocks.listDashboardMembers.mockResolvedValue([
      {
        id: "member-1",
        activeRoutineId: "routine-1",
        address: null,
        birthDate: null,
        branchName: "Centro",
        currentRoutineTitle: "Fuerza base",
        districtOrUrbanization: null,
        email: "active@test.com",
        externalCode: "EXT-1",
        fullName: "Activo Uno",
        gender: null,
        joinDate: "2026-01-01",
        legacyNotes: null,
        linkedUserEmail: null,
        linkedUserId: null,
        memberNumber: "NF-001",
        nextActionLabel: "Ver rutina activa",
        occupation: null,
        phone: null,
        planLabel: "Plan Pro",
        preferredSchedule: null,
        profileCompleted: true,
        status: "active",
        trainerName: null,
        trainerUserId: null,
        updatedAt: "2026-05-01T10:00:00.000Z",
      },
      {
        id: "member-2",
        activeRoutineId: null,
        address: null,
        birthDate: null,
        branchName: "Centro",
        currentRoutineTitle: null,
        districtOrUrbanization: null,
        email: "paused@test.com",
        externalCode: "EXT-2",
        fullName: "Pausa Dos",
        gender: null,
        joinDate: "2026-01-02",
        legacyNotes: null,
        linkedUserEmail: null,
        linkedUserId: null,
        memberNumber: "NF-002",
        nextActionLabel: "Asignar rutina",
        occupation: null,
        phone: null,
        planLabel: "Plan Base",
        preferredSchedule: null,
        profileCompleted: false,
        status: "paused",
        trainerName: null,
        trainerUserId: null,
        updatedAt: "2026-05-02T10:00:00.000Z",
      },
    ]);
  });

  it("renders summary stats and filtered export href", async () => {
    const Page = (await import("./page")).default;
    render(
      await Page({
        searchParams: Promise.resolve({ q: " Titan Prime ", status: "active" }),
      }),
    );

    expect(pageMocks.listDashboardMembers).toHaveBeenCalledWith({
      search: " Titan Prime ",
      status: "active",
    });
    expect(screen.getByRole("heading", { level: 1, name: "MEMBER SCOUTING" })).toBeInTheDocument();
    expect(within(screen.getByText("Poblacion Total").closest("section")!).getByText("2")).toBeInTheDocument();
    expect(within(screen.getByText("Socios Activos").closest("section")!).getByText("1")).toBeInTheDocument();
    expect(within(screen.getByText("Sin Rutina").closest("section")!).getByText("1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Titan Prime")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("active");
    expect(screen.getByRole("link", { name: /Registrar Socio/i })).toHaveAttribute(
      "href",
      "/dashboard/miembros/nuevo",
    );
    expect(screen.getByRole("link", { name: /Descargar CSV/i })).toHaveAttribute(
      "href",
      "/api/dashboard/members/export?q=%20Titan%20Prime%20&status=active",
    );
    expect(screen.getByTestId("members-table")).toHaveTextContent("2");
  });

  it("uses bare export url when filters are empty", async () => {
    const Page = (await import("./page")).default;
    render(
      await Page({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(pageMocks.listDashboardMembers).toHaveBeenCalledWith({
      search: undefined,
      status: undefined,
    });
    expect(screen.getByRole("link", { name: /Descargar CSV/i })).toHaveAttribute(
      "href",
      "/api/dashboard/members/export",
    );
  });
});
