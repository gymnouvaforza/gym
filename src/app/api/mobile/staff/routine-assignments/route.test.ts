import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  assignRoutineToMemberForMobile: vi.fn(),
  requireMobileStaffSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileStaffSession: routeMocks.requireMobileStaffSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  assignRoutineToMemberForMobile: routeMocks.assignRoutineToMemberForMobile,
}));

describe("POST /api/mobile/staff/routine-assignments", () => {
  it("uses the live assignment flow", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { email: "trainer@novaforza.com", id: "trainer-1" },
    });
    routeMocks.assignRoutineToMemberForMobile.mockResolvedValue({
      assignmentId: "assignment-1",
      memberId: "member-1",
      message: "ok",
      status: "active",
      templateId: "template-1",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/mobile/staff/routine-assignments", {
        body: JSON.stringify({ memberId: "member-1", templateId: "template-1" }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    expect(routeMocks.assignRoutineToMemberForMobile).toHaveBeenCalledWith(
      { memberId: "member-1", templateId: "template-1" },
      "trainer-1",
    );
  });
});
