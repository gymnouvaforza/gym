import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getCurrentMemberUser: vi.fn(),
  deleteAuthenticatedMemberAccount: vi.fn(),
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
  deleteAuthenticatedMemberAccount: routeMocks.deleteAuthenticatedMemberAccount,
}));

import { POST } from "./route";

describe("POST /api/member-account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("deletes the authenticated member account", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue({ 
        id: "user-1",
        app_metadata: { roles: ["member"] }
    });
    routeMocks.deleteAuthenticatedMemberAccount.mockResolvedValue({ success: true });

    const response = await POST(
      new Request("http://localhost/api/member-account/delete", {
        body: JSON.stringify({ confirmationText: "ELIMINAR" }),
        method: "POST",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("fails if user is anonymous", async () => {
    routeMocks.getCurrentMemberUser.mockResolvedValue(null);
    const response = await POST(
      new Request("http://localhost/api/member-account/delete", {
        body: JSON.stringify({ confirmationText: "ELIMINAR" }),
        method: "POST",
      }),
    );
    expect(response.status).toBe(401);
  });
});
