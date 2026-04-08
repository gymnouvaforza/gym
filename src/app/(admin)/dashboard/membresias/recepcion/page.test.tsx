// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MembershipReceptionScanResult } from "@/lib/memberships";

const receptionPageMocks = vi.hoisted(() => ({
  getDashboardMembershipScanResultByToken: vi.fn(),
  parseMembershipQrScanToken: vi.fn(),
  requireAdminUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireAdminUser: receptionPageMocks.requireAdminUser,
}));

vi.mock("@/lib/data/memberships", () => ({
  getDashboardMembershipScanResultByToken:
    receptionPageMocks.getDashboardMembershipScanResultByToken,
  parseMembershipQrScanToken: receptionPageMocks.parseMembershipQrScanToken,
}));

vi.mock("@/components/admin/MembershipReceptionScanner", () => ({
  default: ({ initialValue }: { initialValue?: string }) => (
    <div data-testid="scanner">scanner:{initialValue ?? ""}</div>
  ),
}));

vi.mock("@/components/admin/MembershipOpsSubnav", () => ({
  default: () => <div data-testid="membership-ops-subnav" />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const validScanResult: MembershipReceptionScanResult = {
  cycleEndsOn: "2099-05-07",
  cycleStartsOn: "2099-04-08",
  member: {
    id: "member_1",
    memberNumber: "NF-12345678",
    fullName: "Socio Titan",
    email: "socio@example.com",
    phone: null,
    status: "active",
    branchName: "Club Central",
    supabaseUserId: "user_1",
    trainerUserId: "trainer_1",
    trainerName: "Coach Vega",
    trainingPlanLabel: null,
    membershipQrToken: "qr_token_12345",
  },
  membershipRequestId: "request_1",
  planTitle: "Membresia Base",
  publicValidationUrl: "https://club.test/validacion/membresia/qr_token_12345",
  requestNumber: "MEM-20260408-AAAAAA",
  requestStatus: "active",
  validation: {
    status: "al_dia",
    label: "Membresia al dia",
    tone: "success",
    cycleStartsOn: "2099-04-08",
    cycleEndsOn: "2099-05-07",
  },
};

describe("dashboard membership reception page", () => {
  beforeEach(() => {
    receptionPageMocks.requireAdminUser.mockResolvedValue({ id: "admin_1", email: "admin@test" });
    receptionPageMocks.getDashboardMembershipScanResultByToken.mockReset();
    receptionPageMocks.parseMembershipQrScanToken.mockReset();
  });

  it("shows the ready state when there is no token yet", async () => {
    const Page = (await import("./page")).default;

    render(await Page({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Listo para escanear")).toBeInTheDocument();
    expect(screen.getByTestId("scanner")).toHaveTextContent("scanner:");
  });

  it("shows an error when the scanned value does not match a membership QR format", async () => {
    receptionPageMocks.parseMembershipQrScanToken.mockReturnValue(null);

    const Page = (await import("./page")).default;

    render(await Page({ searchParams: Promise.resolve({ token: "codigo-ajeno" }) }));

    expect(screen.getByText("Lectura no reconocida")).toBeInTheDocument();
    expect(screen.getByText(/no parece un qr de membresia/i)).toBeInTheDocument();
  });

  it("shows a warning when the token format is valid but no member is linked", async () => {
    receptionPageMocks.parseMembershipQrScanToken.mockReturnValue("qr_token_missing");
    receptionPageMocks.getDashboardMembershipScanResultByToken.mockResolvedValue(null);

    const Page = (await import("./page")).default;

    render(await Page({ searchParams: Promise.resolve({ token: "qr_token_missing" }) }));

    expect(screen.getByText("QR sin socio vinculado")).toBeInTheDocument();
  });

  it("shows the compact reception view for a valid member result", async () => {
    receptionPageMocks.parseMembershipQrScanToken.mockReturnValue("qr_token_12345");
    receptionPageMocks.getDashboardMembershipScanResultByToken.mockResolvedValue(validScanResult);

    const Page = (await import("./page")).default;

    render(await Page({ searchParams: Promise.resolve({ token: "qr_token_12345" }) }));

    expect(screen.getByText("Socio Titan")).toBeInTheDocument();
    expect(screen.getByText("Membresia Base")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir ficha del socio/i })).toHaveAttribute(
      "href",
      "/dashboard/miembros/member_1",
    );
    expect(
      screen.getByRole("link", { name: /abrir detalle de membresia/i }),
    ).toHaveAttribute("href", "/dashboard/membresias/pedidos/request_1");
    expect(screen.getByRole("link", { name: /abrir validacion publica/i })).toHaveAttribute(
      "href",
      validScanResult.publicValidationUrl,
    );
  });

  it("handles registered members without an active request", async () => {
    receptionPageMocks.parseMembershipQrScanToken.mockReturnValue("qr_token_no_cycle");
    receptionPageMocks.getDashboardMembershipScanResultByToken.mockResolvedValue({
      ...validScanResult,
      membershipRequestId: null,
      requestNumber: null,
      requestStatus: null,
      validation: null,
      planTitle: "Sin membresia operativa",
    } satisfies MembershipReceptionScanResult);

    const Page = (await import("./page")).default;

    render(await Page({ searchParams: Promise.resolve({ token: "qr_token_no_cycle" }) }));

    expect(screen.getByText("Sin membresia operativa")).toBeInTheDocument();
    expect(screen.getByText(/socio registrado sin ciclo operativo vigente/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /abrir detalle de membresia/i }),
    ).not.toBeInTheDocument();
  });
});
