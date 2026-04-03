import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  createMemberProfile: vi.fn(),
  listLiveStaffMembers: vi.fn(),
  requireMobileStaffSession: vi.fn(),
}));

vi.mock("@/lib/mobile/auth", () => ({
  requireMobileStaffSession: routeMocks.requireMobileStaffSession,
}));

vi.mock("@/lib/data/gym-management", () => ({
  createMemberProfile: routeMocks.createMemberProfile,
  listLiveStaffMembers: routeMocks.listLiveStaffMembers,
}));

describe("/api/mobile/staff/members", () => {
  it("returns live staff members on GET in live mode", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { id: "trainer-1" },
    });
    routeMocks.listLiveStaffMembers.mockResolvedValue([{ id: "member-1", fullName: "Nova" }]);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/mobile/staff/members?q=nova"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.listLiveStaffMembers).toHaveBeenCalledWith("nova");
    expect(payload.items).toHaveLength(1);
  });

  it("creates members on POST", async () => {
    routeMocks.requireMobileStaffSession.mockResolvedValue({
      response: null,
      user: { id: "trainer-1" },
    });
    routeMocks.createMemberProfile.mockResolvedValue("member-1");

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/mobile/staff/members", {
        body: JSON.stringify({
          email: "member@novaforza.com",
          fullName: "Nova Tester",
          joinDate: "2026-04-01",
          planLabel: "Elite",
          planStatus: "active",
          status: "active",
        }),
        method: "POST",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(routeMocks.createMemberProfile).toHaveBeenCalled();
    expect(payload.memberId).toBe("member-1");
  });
});
