import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveHistoryForSession: vi.fn(),
  getLiveMobileSession: vi.fn(),
  requireMobileSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileSession: routeMocks.requireMobileSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveHistoryForSession: routeMocks.getLiveHistoryForSession,
  getLiveMobileSession: routeMocks.getLiveMobileSession,
}));

describe("GET /api/mobile/me/history", () => {
  it("returns live history", async () => {
    const mobileSession = {
      displayName: "Member",
      email: "member@novaforza.com",
      hasActiveRoutine: false,
      member: null,
      role: "member",
      userId: "user-1",
    };

    routeMocks.requireMobileSession.mockResolvedValue({
      response: null,
      role: "member",
      user: { email: "member@novaforza.com", id: "user-1" },
    });
    routeMocks.getLiveMobileSession.mockResolvedValue(mobileSession);
    routeMocks.getLiveHistoryForSession.mockResolvedValue({
      items: [{ id: "history-1" }],
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/me/history"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.getLiveMobileSession).toHaveBeenCalled();
    expect(routeMocks.getLiveHistoryForSession).toHaveBeenCalledWith(mobileSession);
    expect(payload.items).toHaveLength(1);
  });
});
