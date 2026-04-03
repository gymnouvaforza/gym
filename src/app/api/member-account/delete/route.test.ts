import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  deleteAuthenticatedMemberAccount: vi.fn(),
  getCurrentMemberUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentMemberUser: routeMocks.getCurrentMemberUser,
}));

vi.mock("@/lib/data/member-account", () => ({
  deleteAuthenticatedMemberAccount: routeMocks.deleteAuthenticatedMemberAccount,
}));

describe("POST /api/member-account/delete", () => {
  it("deletes the authenticated member account", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue({
      email: "member@novaforza.com",
      id: "user-1",
    });
    routeMocks.deleteAuthenticatedMemberAccount.mockResolvedValue(undefined);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/member-account/delete", {
        body: JSON.stringify({
          confirmationText: "ELIMINAR",
          currentPassword: "secret123",
        }),
        method: "POST",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.deleteAuthenticatedMemberAccount).toHaveBeenCalledWith({
      confirmationText: "ELIMINAR",
      currentPassword: "secret123",
    });
    expect(payload.message).toBe("Cuenta eliminada correctamente.");
  });
});
