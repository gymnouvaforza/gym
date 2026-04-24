import { beforeEach, describe, expect, it, vi } from "vitest";

const membershipsDeleteMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: membershipsDeleteMocks.createSupabaseAdminClient,
}));

import { deleteMembershipRequest } from "@/lib/data/memberships";

function createMembershipDeleteClientMock(input: {
  deletedRequest: Record<string, unknown> | null;
  latestRemainingRequest?: Record<string, unknown> | null;
}) {
  const deletedRequest = input.deletedRequest;
  const latestRemainingRequest = input.latestRemainingRequest ?? null;
  const deleteEqMock = vi.fn().mockResolvedValue({ error: null });
  const updateEqMock = vi.fn().mockResolvedValue({ error: null });
  const memberUpdateMock = vi.fn(() => ({
    eq: updateEqMock,
  }));

  const membershipSelectBuilder = (id: string) => ({
    maybeSingle: async () => {
      if (id === "request_delete") {
        return { data: deletedRequest, error: null };
      }

      return { data: null, error: null };
    },
  });

  return {
    deleteEqMock,
    updateEqMock,
    memberUpdateMock,
    client: {
      from(table: string) {
        if (table === "membership_requests") {
          return {
            select() {
              return {
                eq(column: string, value: string) {
                  if (column === "id") {
                    return membershipSelectBuilder(value);
                  }

                  if (column === "member_id") {
                    return {
                      order() {
                        return {
                          limit() {
                            return {
                              maybeSingle: async () => ({
                                data: latestRemainingRequest,
                                error: null,
                              }),
                            };
                          },
                        };
                      },
                    };
                  }

                  throw new Error(`Unexpected membership_requests filter: ${column}`);
                },
              };
            },
            delete() {
              return {
                eq: deleteEqMock,
              };
            },
          };
        }

        if (table === "member_profiles") {
          return {
            update: memberUpdateMock,
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      },
    },
  };
}

describe("deleteMembershipRequest", () => {
  beforeEach(() => {
    membershipsDeleteMocks.createSupabaseAdminClient.mockReset();
  });

  it("recomputes the member profile from the latest remaining request", async () => {
    const mocked = createMembershipDeleteClientMock({
      deletedRequest: {
        id: "request_delete",
        member_id: "member_01",
        status: "active",
      },
      latestRemainingRequest: {
        id: "request_keep",
        member_id: "member_01",
        membership_plan_id: "plan_keep",
        status: "paused",
      },
    });
    membershipsDeleteMocks.createSupabaseAdminClient.mockReturnValue(mocked.client);

    const result = await deleteMembershipRequest("request_delete");

    expect(mocked.deleteEqMock).toHaveBeenCalledWith("id", "request_delete");
    expect(mocked.memberUpdateMock).toHaveBeenCalledWith({
      membership_plan_id: "plan_keep",
      status: "paused",
    });
    expect(mocked.updateEqMock).toHaveBeenCalledWith("id", "member_01");
    expect(result).toEqual({
      id: "request_delete",
      memberId: "member_01",
    });
  });

  it("clears the membership plan when no requests remain", async () => {
    const mocked = createMembershipDeleteClientMock({
      deletedRequest: {
        id: "request_delete",
        member_id: "member_02",
        status: "confirmed",
      },
      latestRemainingRequest: null,
    });
    membershipsDeleteMocks.createSupabaseAdminClient.mockReturnValue(mocked.client);

    await deleteMembershipRequest("request_delete");

    expect(mocked.memberUpdateMock).toHaveBeenCalledWith({
      membership_plan_id: null,
      status: "prospect",
    });
    expect(mocked.updateEqMock).toHaveBeenCalledWith("id", "member_02");
  });
});
