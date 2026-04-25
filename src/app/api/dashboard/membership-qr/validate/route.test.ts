import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import type { AuthUser } from "@/lib/auth-user";

vi.mock("@/lib/auth", () => ({
  getCurrentAdminUser: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  getServerSupabaseEnv: vi.fn().mockReturnValue({ 
    serviceRoleKey: "test-key", 
    url: "https://test.supabase.co" 
  }),
}));

vi.mock("@/lib/data/memberships", () => ({
  getDashboardMembershipScanResultByToken: vi.fn(),
  parseMembershipQrScanToken: vi.fn(),
}));

describe("POST /api/dashboard/membership-qr/validate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("returns 401 if user is not admin", async () => {
    const { getCurrentAdminUser } = await import("@/lib/auth");
    vi.mocked(getCurrentAdminUser).mockResolvedValue(null);

    const response = await POST(new Request("http://localhost", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("returns 400 if scannedValue is missing", async () => {
    const { getCurrentAdminUser } = await import("@/lib/auth");
    vi.mocked(getCurrentAdminUser).mockResolvedValue({ 
      id: "admin-1", 
      email: "admin@test.com",
      emailVerified: true,
      app_metadata: {},
      user_metadata: {},
      identities: []
    } as AuthUser);

    const response = await POST(
      new Request("http://localhost", { 
        method: "POST", 
        body: JSON.stringify({}) 
      })
    );
    expect(response.status).toBe(400);
  });

  it("returns 200 on successful validation from Supabase Function", async () => {
    const { getCurrentAdminUser } = await import("@/lib/auth");
    vi.mocked(getCurrentAdminUser).mockResolvedValue({ 
      id: "admin-1", 
      email: "admin@test.com",
      emailVerified: true,
      app_metadata: {},
      user_metadata: {},
      identities: []
    } as AuthUser);

    const mockPayload = {
      status: "ok",
      reasonCode: "ok",
      canEnter: true,
      validationLabel: "Socio al día",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPayload,
    } as unknown as Response);

    const response = await POST(
      new Request("http://localhost", { 
        method: "POST", 
        body: JSON.stringify({ scannedValue: "valid-token" }) 
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("ok");
  });
});
