import { beforeEach, describe, expect, it, vi } from "vitest";

const hasSupabasePublicEnvMock = vi.fn();
const hasSupabaseServiceRoleMock = vi.fn();
const createSupabasePublicClientMock = vi.fn();
const createSupabaseAdminClientMock = vi.fn();

vi.mock("@/lib/env", async () => {
  const actual = await vi.importActual<typeof import("@/lib/env")>("@/lib/env");
  return {
    ...actual,
    hasSupabasePublicEnv: () => hasSupabasePublicEnvMock(),
    hasSupabaseServiceRole: () => hasSupabaseServiceRoleMock(),
  };
});

vi.mock("@/lib/supabase/server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/server")>(
    "@/lib/supabase/server",
  );
  return {
    ...actual,
    createSupabasePublicClient: () => createSupabasePublicClientMock(),
    createSupabaseAdminClient: () => createSupabaseAdminClientMock(),
  };
});

describe("getDashboardSnapshot", () => {
  beforeEach(() => {
    hasSupabasePublicEnvMock.mockReset();
    hasSupabaseServiceRoleMock.mockReset();
    createSupabasePublicClientMock.mockReset();
    createSupabaseAdminClientMock.mockReset();
  });

  it("blocks dashboard contacts instead of showing demo leads when service role is missing", async () => {
    hasSupabasePublicEnvMock.mockReturnValue(true);
    hasSupabaseServiceRoleMock.mockReturnValue(false);

    createSupabasePublicClientMock.mockReturnValue({
      from: (table: string) => {
        if (table === "site_settings") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { site_name: "Nova Forza real" },
                  error: null,
                }),
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: async () => ({
              data: [],
              error: null,
            }),
          }),
        };
      },
    });

    const { getDashboardSnapshot } = await import("@/lib/supabase/queries");
    const snapshot = await getDashboardSnapshot();

    expect(snapshot.leads).toEqual([]);
    expect(snapshot.warning).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(snapshot.settings.site_name).toBe("Nova Forza real");
  });

  it("loads plans and schedule rows from the shared marketing snapshot", async () => {
    hasSupabasePublicEnvMock.mockReturnValue(true);

    createSupabasePublicClientMock.mockReturnValue({
      from: (table: string) => {
        if (table === "site_settings") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { site_name: "Nova Forza real" },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === "marketing_plans") {
          return {
            select: () => ({
              eq: async () => ({
                data: [
                  {
                    id: "plan-1",
                    site_settings_id: 1,
                    title: "Plan real",
                    description: null,
                    price_label: "S/220",
                    billing_label: "/mes",
                    badge: "Top",
                    features: [{ label: "Libre", included: true }],
                    is_featured: true,
                    order: 0,
                    is_active: true,
                    created_at: new Date(0).toISOString(),
                    updated_at: new Date(0).toISOString(),
                  },
                ],
                error: null,
              }),
            }),
          };
        }

        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  id: "row-1",
                  site_settings_id: 1,
                  label: "Lunes",
                  description: null,
                  opens_at: "06:00 AM",
                  closes_at: "10:00 PM",
                  order: 0,
                  is_active: true,
                  created_at: new Date(0).toISOString(),
                  updated_at: new Date(0).toISOString(),
                },
              ],
              error: null,
            }),
          }),
        };
      },
    });

    const { getMarketingSnapshot } = await import("@/lib/supabase/queries");
    const snapshot = await getMarketingSnapshot();

    expect(snapshot.settings.site_name).toBe("Nova Forza real");
    expect(snapshot.plans[0]?.title).toBe("Plan real");
    expect(snapshot.scheduleRows[0]?.label).toBe("Lunes");
  });
});
