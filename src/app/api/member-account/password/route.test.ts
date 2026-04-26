import { describe, expect, it, vi, beforeEach } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getCurrentMemberUser: vi.fn(),
  changeAuthenticatedMemberPassword: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    getCurrentMemberUser: routeMocks.getCurrentMemberUser,
    getAuthenticatedUser: routeMocks.getCurrentMemberUser,
  };
});

vi.mock("@/lib/data/member-account", () => ({
  changeAuthenticatedMemberPassword: routeMocks.changeAuthenticatedMemberPassword,
}));

import { PATCH } from "./route";

describe("PATCH /api/member-account/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("changes password for the authenticated member", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    routeMocks.changeAuthenticatedMemberPassword.mockResolvedValue({ success: true });

    const response = await PATCH(
      new Request("http://localhost/api/member-account/password", {
        body: JSON.stringify({
          confirmPassword: "secret999",
          newPassword: "secret999",
        }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("fails if user is anonymous", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue(null);
    const response = await PATCH(
      new Request("http://localhost/api/member-account/password", {
        body: JSON.stringify({ newPassword: "new" }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(401);
  });
});
