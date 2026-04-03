import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  changeAuthenticatedMemberPassword: vi.fn(),
  getCurrentMemberUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentMemberUser: routeMocks.getCurrentMemberUser,
}));

vi.mock("@/lib/data/member-account", () => ({
  changeAuthenticatedMemberPassword: routeMocks.changeAuthenticatedMemberPassword,
}));

describe("PATCH /api/member-account/password", () => {
  it("changes password for the authenticated member", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue({
      email: "member@novaforza.com",
      id: "user-1",
    });
    routeMocks.changeAuthenticatedMemberPassword.mockResolvedValue(undefined);

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/member-account/password", {
        body: JSON.stringify({
          confirmPassword: "secret999",
          currentPassword: "secret123",
          newPassword: "secret999",
        }),
        method: "PATCH",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.changeAuthenticatedMemberPassword).toHaveBeenCalledWith({
      confirmPassword: "secret999",
      currentPassword: "secret123",
      newPassword: "secret999",
    });
    expect(payload.message).toBe("Contrasena actualizada correctamente.");
  });
});
