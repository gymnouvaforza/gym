import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  getServerSupabaseEnv: vi.fn().mockReturnValue({ serviceRoleKey: "test-key", url: "https://test.supabase.co" }),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    requireAdminUser: mocks.requireAdminUser,
  };
});

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return {
    ...actual,
    getServerSupabaseEnv: mocks.getServerSupabaseEnv,
  };
});

vi.mock("@/lib/data/memberships", () => ({
  getDashboardMembershipScanResultByToken: vi.fn(),
  parseMembershipQrScanToken: vi.fn(),
}));

import { POST } from "./route";

describe("POST /api/dashboard/membership-qr/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    process.env.NODE_ENV = "test";
  });

  it("fails if requireAdminUser fails (redirects/throws)", async () => {
    mocks.requireAdminUser.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    await expect(POST(new Request("http://localhost", { method: "POST" }))).rejects.toThrow("NEXT_REDIRECT");
  });

  it("returns 400 if scannedValue is missing", async () => {
    mocks.requireAdminUser.mockResolvedValue({ id: "admin-1", app_metadata: { roles: ["admin"] } });
    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({}) })
    );
    expect(response.status).toBe(400);
  });

  it("returns 200 on successful validation", async () => {
    mocks.requireAdminUser.mockResolvedValue({ id: "admin-1", app_metadata: { roles: ["admin"] } });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok", canEnter: true }),
    } as any);

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ scannedValue: "token" }) })
    );
    expect(response.status).toBe(200);
  });

  it("does not leak stack traces on internal errors", async () => {
    process.env.NODE_ENV = "production";
    mocks.requireAdminUser.mockResolvedValue({ id: "admin-1", app_metadata: { roles: ["admin"] } });
    vi.mocked(fetch).mockRejectedValue(new Error("Sensitive internal error"));

    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ scannedValue: "token" }) })
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(JSON.stringify(data)).not.toContain("Sensitive internal error");
  });
});
