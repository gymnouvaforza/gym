import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: supabaseMocks.createSupabaseAdminClient,
}));

import {
  getDashboardMembershipScanResultByToken,
  parseMembershipQrScanToken,
} from "@/lib/data/memberships";

function createMembershipClientMock(options?: {
  member?: Record<string, unknown> | null;
  latestRequest?: Record<string, unknown> | null;
  plan?: Record<string, unknown> | null;
  trainer?: Record<string, unknown> | null;
}) {
  const member = options?.member ?? null;
  const latestRequest = options?.latestRequest ?? null;
  const plan = options?.plan ?? null;
  const trainer = options?.trainer ?? null;

  return {
    from(table: string) {
      return {
        select() {
          if (table === "member_profiles") {
            return {
              eq(column: string) {
                if (column === "membership_qr_token") {
                  return {
                    maybeSingle: async () => ({ data: member, error: null }),
                  };
                }

                return {
                  maybeSingle: async () => ({ data: member, error: null }),
                };
              },
              in: async () => ({
                data: member ? [member] : [],
                error: null,
              }),
            };
          }

          if (table === "membership_requests") {
            return {
              eq() {
                return {
                  order() {
                    return {
                      limit() {
                        return {
                          maybeSingle: async () => ({ data: latestRequest, error: null }),
                        };
                      },
                    };
                  },
                };
              },
            };
          }

          if (table === "membership_plans") {
            return {
              in: async () => ({
                data: plan ? [plan] : [],
                error: null,
              }),
            };
          }

          if (table === "trainer_profiles") {
            return {
              in: async () => ({
                data: trainer ? [trainer] : [],
                error: null,
              }),
            };
          }

          throw new Error(`Unexpected table: ${table}`);
        },
      };
    },
  };
}

describe("membership QR reception helpers", () => {
  beforeEach(() => {
    supabaseMocks.createSupabaseAdminClient.mockReset();
  });

  it("extracts the token from a full validation URL", () => {
    expect(
      parseMembershipQrScanToken(
        "https://nuovaforza.test/validacion/membresia/qr_token_12345",
      ),
    ).toBe("qr_token_12345");
  });

  it("accepts a raw token and rejects unrelated URLs", () => {
    expect(parseMembershipQrScanToken("qr_token_12345")).toBe("qr_token_12345");
    expect(parseMembershipQrScanToken("/validacion/membresia/qr_token_67890")).toBe(
      "qr_token_67890",
    );
    expect(parseMembershipQrScanToken("https://example.com/otra/ruta")).toBeNull();
  });

  it("returns the operational member result for a valid membership token", async () => {
    supabaseMocks.createSupabaseAdminClient.mockReturnValue(
      createMembershipClientMock({
        member: {
          id: "member_1",
          member_number: "NF-12345678",
          full_name: "Socio Titan",
          email: "socio@example.com",
          phone: null,
          status: "active",
          branch_name: "Club Central",
          supabase_user_id: "user_1",
          trainer_user_id: "trainer_1",
          training_plan_label: null,
          membership_qr_token: "qr_token_12345",
          membership_plan_id: "plan_1",
        },
        latestRequest: {
          id: "request_1",
          request_number: "MEM-20260408-AAAAAA",
          member_id: "member_1",
          membership_plan_id: "plan_1",
          email: "socio@example.com",
          supabase_user_id: "user_1",
          status: "active",
          source: "member-portal",
          notes: null,
          created_at: "2026-04-08T08:00:00.000Z",
          updated_at: "2026-04-08T08:00:00.000Z",
          activated_at: "2026-04-08T08:10:00.000Z",
          email_status: "sent",
          email_sent_at: "2026-04-08T08:11:00.000Z",
          email_error: null,
          cycle_starts_on: "2026-04-08",
          cycle_ends_on: "2099-05-07",
          billing_label: "30 dias",
          currency_code: "PEN",
          duration_days: 30,
          price_amount: 120,
          plan_title_snapshot: "Membresia Base",
          renews_from_request_id: null,
          manual_paid_total: 120,
          manual_balance_due: 0,
          manual_payment_status: "paid",
          manual_payment_entry_count: 1,
          manual_payment_updated_at: "2026-04-08T08:12:00.000Z",
          medusa_product_id: null,
          medusa_variant_id: null,
          medusa_cart_id: null,
          medusa_order_id: null,
          medusa_sync_status: "ok",
          medusa_sync_error: null,
          medusa_synced_at: "2026-04-08T08:15:00.000Z",
        },
        plan: {
          id: "plan_1",
          slug: "base-30d",
          title: "Membresia Base",
          description: null,
          price_amount: 120,
          currency_code: "PEN",
          billing_label: "30 dias",
          duration_days: 30,
          is_active: true,
          is_featured: false,
          notes: null,
          sort_order: 1,
          medusa_product_id: null,
          medusa_variant_id: null,
          medusa_sync_status: "ok",
          medusa_sync_error: null,
          medusa_synced_at: null,
          created_at: "2026-04-08T08:00:00.000Z",
          updated_at: "2026-04-08T08:00:00.000Z",
        },
        trainer: {
          user_id: "trainer_1",
          display_name: "Coach Vega",
        },
      }),
    );

    const result = await getDashboardMembershipScanResultByToken("qr_token_12345");

    expect(result).not.toBeNull();
    expect(result?.member.fullName).toBe("Socio Titan");
    expect(result?.member.trainerName).toBe("Coach Vega");
    expect(result?.membershipRequestId).toBe("request_1");
    expect(result?.validation?.status).toBe("al_dia");
    expect(result?.planTitle).toBe("Membresia Base");
  });

  it("returns a registered member without operational cycle when no request exists", async () => {
    supabaseMocks.createSupabaseAdminClient.mockReturnValue(
      createMembershipClientMock({
        member: {
          id: "member_2",
          member_number: "NF-87654321",
          full_name: "Alta Manual",
          email: "manual@example.com",
          phone: null,
          status: "prospect",
          branch_name: null,
          supabase_user_id: null,
          trainer_user_id: null,
          training_plan_label: null,
          membership_qr_token: "qr_token_manual",
          membership_plan_id: "plan_2",
        },
        latestRequest: null,
        plan: {
          id: "plan_2",
          slug: "elite",
          title: "Membresia Elite",
          description: null,
          price_amount: 260,
          currency_code: "PEN",
          billing_label: "30 dias",
          duration_days: 30,
          is_active: true,
          is_featured: true,
          notes: null,
          sort_order: 2,
          medusa_product_id: null,
          medusa_variant_id: null,
          medusa_sync_status: "pending",
          medusa_sync_error: null,
          medusa_synced_at: null,
          created_at: "2026-04-08T08:00:00.000Z",
          updated_at: "2026-04-08T08:00:00.000Z",
        },
      }),
    );

    const result = await getDashboardMembershipScanResultByToken("qr_token_manual");

    expect(result).not.toBeNull();
    expect(result?.membershipRequestId).toBeNull();
    expect(result?.validation).toBeNull();
    expect(result?.planTitle).toBe("Membresia Elite");
  });

  it("returns null when the QR token is not linked to any member", async () => {
    supabaseMocks.createSupabaseAdminClient.mockReturnValue(
      createMembershipClientMock({
        member: null,
      }),
    );

    await expect(getDashboardMembershipScanResultByToken("missing_token")).resolves.toBeNull();
  });
});
