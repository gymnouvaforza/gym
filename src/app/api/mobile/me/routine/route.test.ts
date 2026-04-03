import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveMobileSession: vi.fn(),
  getLiveRoutineForSession: vi.fn(),
  requireMobileSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileSession: routeMocks.requireMobileSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveMobileSession: routeMocks.getLiveMobileSession,
  getLiveRoutineForSession: routeMocks.getLiveRoutineForSession,
}));

describe("GET /api/mobile/me/routine", () => {
  it("returns live routine data", async () => {
    const mobileSession = {
      displayName: "Member",
      email: "member@novaforza.com",
      hasActiveRoutine: true,
      member: { id: "member-1" },
      role: "member",
      userId: "user-1",
    };

    routeMocks.requireMobileSession.mockResolvedValue({
      response: null,
      role: "member",
      user: { email: "member@novaforza.com", id: "user-1" },
    });
    routeMocks.getLiveMobileSession.mockResolvedValue(mobileSession);
    routeMocks.getLiveRoutineForSession.mockResolvedValue({ id: "routine-1", title: "Fuerza" });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/me/routine"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.getLiveRoutineForSession).toHaveBeenCalledWith(mobileSession);
    expect(payload.routine.title).toBe("Fuerza");
  });
});
