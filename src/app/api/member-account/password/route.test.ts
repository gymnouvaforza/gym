import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
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
    getCurrentMemberUser: mocks.getCurrentMemberUser,
    getAuthenticatedUser: mocks.getCurrentMemberUser,
  };
});

vi.mock("@/lib/data/member-account", () => ({
  changeAuthenticatedMemberPassword: mocks.changeAuthenticatedMemberPassword,
}));

import { PATCH } from "./route";

describe("PATCH /api/member-account/password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("changes password for the authenticated member", async () => {
    mocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    mocks.changeAuthenticatedMemberPassword.mockResolvedValue({ success: true });

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
    mocks.getCurrentMemberUser.mockResolvedValue(null);
    const response = await PATCH(
      new Request("http://localhost/api/member-account/password", {
        body: JSON.stringify({ newPassword: "new" }),
        method: "PATCH",
      }),
    );
    expect(response.status).toBe(401);
  });
});
