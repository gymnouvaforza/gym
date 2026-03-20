import { afterEach, describe, expect, it, vi } from "vitest";

const envMocks = vi.hoisted(() => ({
  hasMedusaAdminEnv: vi.fn(),
  hasSupabaseServiceRole: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  hasMedusaAdminEnv: () => envMocks.hasMedusaAdminEnv(),
  hasSupabaseServiceRole: () => envMocks.hasSupabaseServiceRole(),
}));

describe("store admin runtime guards", () => {
  afterEach(() => {
    vi.resetModules();
    envMocks.hasMedusaAdminEnv.mockReset();
    envMocks.hasSupabaseServiceRole.mockReset();
  });

  it("blocks writes when Medusa admin credentials are missing", async () => {
    envMocks.hasMedusaAdminEnv.mockReturnValue(false);
    envMocks.hasSupabaseServiceRole.mockReturnValue(true);

    const mod = await import("@/lib/data/store-admin");

    expect(mod.getStoreAdminWriteDisabledReason()).toContain("MEDUSA_ADMIN_API_KEY");
  });

  it("blocks writes when the Supabase bridge cannot persist ids", async () => {
    envMocks.hasMedusaAdminEnv.mockReturnValue(true);
    envMocks.hasSupabaseServiceRole.mockReturnValue(false);

    const mod = await import("@/lib/data/store-admin");

    expect(mod.getStoreAdminWriteDisabledReason()).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
