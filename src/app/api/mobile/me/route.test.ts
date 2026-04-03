import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveMobileSession: vi.fn(),
  requireMobileSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileSession: routeMocks.requireMobileSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveMobileSession: routeMocks.getLiveMobileSession,
}));

describe("GET /api/mobile/me", () => {
  it("returns live session data", async () => {
    const user = { email: "member@novaforza.com", id: "user-1" };

    routeMocks.requireMobileSession.mockResolvedValue({
      response: null,
      role: "member",
      user,
    });
    routeMocks.getLiveMobileSession.mockResolvedValue({
      displayName: "Member",
      email: "member@novaforza.com",
      hasActiveRoutine: false,
      member: null,
      role: "member",
      userId: "user-1",
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/me"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.getLiveMobileSession).toHaveBeenCalledWith(user, "member");
    expect(payload.role).toBe("member");
  });
});
