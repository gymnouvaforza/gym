import { describe, expect, it, vi, beforeEach } from "vitest";

const routeMocks = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  exportLeadsToCsv: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...actual,
    requireAdminUser: routeMocks.requireAdminUser,
  };
});

vi.mock("@/lib/data/leads", () => ({
  exportLeadsToCsv: routeMocks.exportLeadsToCsv,
}));

import { GET } from "../route";

describe("GET /api/dashboard/leads/export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports leads to CSV for admin user", async () => {
    routeMocks.requireAdminUser.mockResolvedValue({ 
        id: "admin-1",
        app_metadata: { roles: ["admin"] }
    } as any);
    routeMocks.exportLeadsToCsv.mockResolvedValue("name,email\ntest,test@test.com");

    const response = await GET();
    expect(response.status).toBe(200);
  });

  it("fails if user is not an admin", async () => {
    routeMocks.requireAdminUser.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
    await expect(GET()).rejects.toThrow("NEXT_REDIRECT");
  });
});
