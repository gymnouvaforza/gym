import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
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
    getCurrentMemberUser: mocks.getCurrentMemberUser,
    getAuthenticatedUser: mocks.getCurrentMemberUser,
  };
});

vi.mock("@/lib/data/member-account", () => ({
  updateAuthenticatedMemberAccount: mocks.updateAuthenticatedMemberAccount,
}));

import { PATCH } from "./route";

describe("PATCH /api/member-account/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("updates the authenticated member account", async () => {
    mocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    mocks.updateAuthenticatedMemberAccount.mockResolvedValue({ fullName: "Nova Tester" });

    const response = await PATCH(
      new Request("http://localhost/api/member-account/profile", {
        body: JSON.stringify({ fullName: "Nova Tester" }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("fails if user is anonymous", async () => {
    mocks.getCurrentMemberUser.mockResolvedValue(null);
    const response = await PATCH(
      new Request("http://localhost/api/member-account/profile", {
        body: JSON.stringify({ fullName: "Attacker" }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(401);
  });
});
