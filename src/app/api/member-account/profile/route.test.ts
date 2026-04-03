import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getCurrentMemberUser: vi.fn(),
  updateAuthenticatedMemberAccount: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentMemberUser: routeMocks.getCurrentMemberUser,
}));

vi.mock("@/lib/data/member-account", () => ({
  updateAuthenticatedMemberAccount: routeMocks.updateAuthenticatedMemberAccount,
}));

describe("PATCH /api/member-account/profile", () => {
  it("updates the authenticated member account", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue({
      email: "member@novaforza.com",
      id: "user-1",
    });
    routeMocks.updateAuthenticatedMemberAccount.mockResolvedValue({
      email: "member@novaforza.com",
      fullName: "Nova Tester",
      phone: "600123123",
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/member-account/profile", {
        body: JSON.stringify({
          email: "member@novaforza.com",
          fullName: "Nova Tester",
          phone: "600123123",
        }),
        method: "PATCH",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.updateAuthenticatedMemberAccount).toHaveBeenCalledWith({
      email: "member@novaforza.com",
      fullName: "Nova Tester",
      phone: "600123123",
    });
    expect(payload.account.fullName).toBe("Nova Tester");
  });
});
