import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getLiveStaffMemberDetail: vi.fn(),
  requireMobileStaffSession: vi.fn(),
  updateLiveMemberFromMobile: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileStaffSession: routeMocks.requireMobileStaffSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  getLiveStaffMemberDetail: routeMocks.getLiveStaffMemberDetail,
  updateLiveMemberFromMobile: routeMocks.updateLiveMemberFromMobile,
}));

describe("/api/mobile/staff/members/[id]", () => {
  it("returns live detail on GET", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { id: "trainer-1" },
    });
    routeMocks.getLiveStaffMemberDetail.mockResolvedValue({
      accountTypeLabel: "Elite",
      activeRoutine: null,
      assignmentHistory: [],
      branchLabel: "Centro",
      lastAttendanceLabel: "ayer",
      member: {
        branchName: "Centro",
        currentRoutineTitle: null,
        email: "member@novaforza.com",
        fullName: "Member",
        id: "member-1",
        joinDate: "2025-01-01",
        memberNumber: "NF-1",
        nextActionLabel: "Asignar rutina",
        planLabel: "Elite",
        status: "active",
      },
      plan: null,
      quickStats: [],
      recommendedAction: {
        helperText: "helper",
        title: "title",
      },
      status: {
        helperText: "helper",
        label: "ACTIVE",
        status: "active",
      },
      trainingFeedback: {
        exercises: [],
        routine: null,
      },
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "member-1" }),
    });

    expect(response.status).toBe(200);
    expect(routeMocks.getLiveStaffMemberDetail).toHaveBeenCalledWith("member-1");
  });

  it("updates member detail on PATCH", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { id: "trainer-1" },
    });
    routeMocks.updateLiveMemberFromMobile.mockResolvedValue(undefined);
    routeMocks.getLiveStaffMemberDetail.mockResolvedValue({
      accountTypeLabel: "Elite",
      activeRoutine: null,
      assignmentHistory: [],
      branchLabel: "Centro",
      lastAttendanceLabel: "ayer",
      member: {
        branchName: "Centro",
        currentRoutineTitle: null,
        email: "member@novaforza.com",
        fullName: "Member",
        id: "member-1",
        joinDate: "2025-01-01",
        memberNumber: "NF-1",
        nextActionLabel: "Asignar rutina",
        planLabel: "Elite",
        status: "paused",
      },
      plan: null,
      quickStats: [],
      recommendedAction: {
        helperText: "helper",
        title: "title",
      },
      status: {
        helperText: "helper",
        label: "PAUSED",
        status: "paused",
      },
      trainingFeedback: {
        exercises: [],
        routine: null,
      },
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost", {
        body: JSON.stringify({ status: "paused" }),
        method: "PATCH",
      }),
      {
        params: Promise.resolve({ id: "member-1" }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.updateLiveMemberFromMobile).toHaveBeenCalledWith("member-1", {
      status: "paused",
    });
    expect(payload.status.status).toBe("paused");
  });
});
