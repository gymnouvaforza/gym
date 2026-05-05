// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const receptionPageMocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  listRecentMemberCheckins: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth", () => ({
  requireAdminUser: receptionPageMocks.requireAdminUser,
}));

vi.mock("@/lib/data/member-checkins", () => ({
  listRecentMemberCheckins: receptionPageMocks.listRecentMemberCheckins,
}));

vi.mock("@/components/admin/ReceptionWorkspace", () => ({
  default: ({ initialRecentCheckins }: { initialRecentCheckins: unknown[] }) => (
    <div data-testid="reception-workspace">
      <span data-testid="checkin-count">{initialRecentCheckins.length}</span>
    </div>
  ),
}));

describe("dashboard reception page", () => {
  beforeEach(() => {
    receptionPageMocks.requireAdminUser.mockResolvedValue({
      id: "admin_1",
      email: "admin@test",
    });
    receptionPageMocks.listRecentMemberCheckins.mockResolvedValue([]);
  });

  it("renders reception page with workspace for authenticated staff", async () => {
    const Page = (await import("./page")).default;

    render(await Page());

    expect(screen.getByText("RECEPCION")).toBeInTheDocument();
    expect(screen.getByTestId("reception-workspace")).toBeInTheDocument();
  });

  it("passes recent checkins to workspace", async () => {
    receptionPageMocks.listRecentMemberCheckins.mockResolvedValue([
      {
        id: "ck1",
        checkedInAt: "2026-05-05T10:00:00.000Z",
        memberId: "m1",
        memberName: "Juan Perez",
        memberNumber: "NF-001",
        statusSnapshot: "active",
        method: "manual",
        registeredByEmail: "admin@test",
      },
    ]);

    const Page = (await import("./page")).default;
    render(await Page());

    expect(screen.getByTestId("checkin-count")).toHaveTextContent("1");
  });
});
