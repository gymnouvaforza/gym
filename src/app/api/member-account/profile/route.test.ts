import { describe, expect, it, vi, beforeEach } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getCurrentMemberUser: vi.fn(),
  updateAuthenticatedMemberAccount: vi.fn(),
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
  updateAuthenticatedMemberAccount: routeMocks.updateAuthenticatedMemberAccount,
}));

import { PATCH } from "./route";

describe("PATCH /api/member-account/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the authenticated member account", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    routeMocks.updateAuthenticatedMemberAccount.mockResolvedValue({ fullName: "Nova Tester" });

    const response = await PATCH(
      new Request("http://localhost/api/member-account/profile", {
        body: JSON.stringify({ fullName: "Nova Tester" }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("fails if user is anonymous", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue(null);
    const response = await PATCH(
      new Request("http://localhost/api/member-account/profile", {
        body: JSON.stringify({ fullName: "Attacker" }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(401);
  });
});
