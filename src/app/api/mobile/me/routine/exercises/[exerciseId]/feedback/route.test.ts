import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveMobileSession: vi.fn(),
  requireMobileSession: vi.fn(),
  updateLiveExerciseFeedbackForSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileSession: routeMocks.requireMobileSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveMobileSession: routeMocks.getLiveMobileSession,
  updateLiveExerciseFeedbackForSession: routeMocks.updateLiveExerciseFeedbackForSession,
}));

describe("PATCH /api/mobile/me/routine/exercises/[exerciseId]/feedback", () => {
  it("updates feedback for an exercise in the active routine", async () => {
    const mobileSession = {
      displayName: "Member",
      email: "member@novaforza.com",
      hasActiveRoutine: true,
      member: { id: "member-1" },
      role: "member",
      staffAccessLevel: null,
      userId: "user-1",
    };

    routeMocks.requireMobileSession.mockResolvedValue({
      response: null,
      role: "member",
      staffAccessLevel: null,
      user: { email: "member@novaforza.com", id: "user-1" },
    });
    routeMocks.getLiveMobileSession.mockResolvedValue(mobileSession);
    routeMocks.updateLiveExerciseFeedbackForSession.mockResolvedValue({
      id: "routine-1",
      title: "Fuerza",
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/mobile/me/routine/exercises/exercise-1/feedback", {
        body: JSON.stringify({ liked: true, note: "Bien" }),
        method: "PATCH",
      }),
      {
        params: Promise.resolve({ exerciseId: "exercise-1" }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.updateLiveExerciseFeedbackForSession).toHaveBeenCalledWith(
      mobileSession,
      "exercise-1",
      {
        liked: true,
        note: "Bien",
      },
    );
    expect(payload.routine.title).toBe("Fuerza");
  });
});
