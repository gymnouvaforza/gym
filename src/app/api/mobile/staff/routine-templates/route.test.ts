import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  listLiveRoutineTemplates: vi.fn(),
  requireMobileStaffSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileStaffSession: routeMocks.requireMobileStaffSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  listLiveRoutineTemplates: routeMocks.listLiveRoutineTemplates,
}));

describe("GET /api/mobile/staff/routine-templates", () => {
  it("returns live templates", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { id: "trainer-1" },
    });
    routeMocks.listLiveRoutineTemplates.mockResolvedValue([{ id: "template-1", title: "Fuerza" }]);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/staff/routine-templates"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.items[0].title).toBe("Fuerza");
  });
});
