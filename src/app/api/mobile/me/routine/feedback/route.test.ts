import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveMobileSession: vi.fn(),
  requireMobileSession: vi.fn(),
  updateLiveRoutineFeedbackForSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileSession: routeMocks.requireMobileSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveMobileSession: routeMocks.getLiveMobileSession,
  updateLiveRoutineFeedbackForSession: routeMocks.updateLiveRoutineFeedbackForSession,
}));

describe("PATCH /api/mobile/me/routine/feedback", () => {
  it("updates feedback for the active routine", async () => {
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
    routeMocks.updateLiveRoutineFeedbackForSession.mockResolvedValue({
      id: "routine-1",
      title: "Fuerza",
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/mobile/me/routine/feedback", {
        body: JSON.stringify({ liked: true, note: "Gran rutina" }),
        method: "PATCH",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.updateLiveRoutineFeedbackForSession).toHaveBeenCalledWith(mobileSession, {
      liked: true,
      note: "Gran rutina",
    });
    expect(payload.routine.title).toBe("Fuerza");
  });
});
