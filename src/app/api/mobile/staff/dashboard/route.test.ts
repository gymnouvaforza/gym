import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveStaffDashboard: vi.fn(),
  requireMobileStaffSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileStaffSession: routeMocks.requireMobileStaffSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveStaffDashboard: routeMocks.getLiveStaffDashboard,
}));

describe("GET /api/mobile/staff/dashboard", () => {
  it("returns the auth response when staff access is rejected", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: Response.json({ error: "forbidden" }, { status: 403 }),
      user: null,
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/staff/dashboard"));

    expect(response.status).toBe(403);
  });

  it("returns live staff dashboard in live mode", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { id: "trainer-1" },
    });
    routeMocks.getLiveStaffDashboard.mockResolvedValue({
      activeMembers: 3,
      pendingAssignments: 1,
      quickActions: [],
      recentActivity: [],
      systemStatus: "ok",
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/staff/dashboard"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.activeMembers).toBe(3);
  });
});
