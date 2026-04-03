import {
  useAssignRoutineMutation,
  useMemberRoutineQuery,
  useUpdateStaffMemberMutation,
} from "@/hooks/use-mobile-queries";

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockMobileFetchJson = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

jest.mock("@/lib/api", () => ({
  mobileFetchJson: (...args: unknown[]) => mockMobileFetchJson(...args),
}));

jest.mock("@/providers/auth-provider", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("use-mobile-queries", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      session: { access_token: "token-1" },
    });
    mockUseQuery.mockImplementation((options: Record<string, unknown>) => options);
    mockUseMutation.mockImplementation((options: Record<string, unknown>) => options);
  });

  it("builds member routine query config with token", async () => {
    const query = useMemberRoutineQuery() as unknown as Record<string, unknown>;

    expect(query.queryKey).toEqual(["member-routine", "token-1"]);
    expect(query.enabled).toBe(true);

    await (query.queryFn as () => Promise<unknown>)();

    expect(mockMobileFetchJson).toHaveBeenCalledWith("/api/mobile/me/routine", {
      accessToken: "token-1",
    });
  });

  it("builds assignment mutation payloads", async () => {
    const mutation = useAssignRoutineMutation() as unknown as Record<string, unknown>;

    await (mutation.mutationFn as (payload: unknown) => Promise<unknown>)({
      memberId: "member-1",
      notes: "Subir carga",
      templateId: "template-1",
    });

    expect(mockMobileFetchJson).toHaveBeenCalledWith(
      "/api/mobile/staff/routine-assignments",
      expect.objectContaining({
        accessToken: "token-1",
        body: JSON.stringify({
          memberId: "member-1",
          notes: "Subir carga",
          templateId: "template-1",
        }),
        method: "POST",
      }),
    );
  });

  it("builds the patch mutation for light staff edits", async () => {
    const mutation = useUpdateStaffMemberMutation("member-1") as unknown as Record<string, unknown>;

    await (mutation.mutationFn as (payload: unknown) => Promise<unknown>)({
      status: "paused",
    });

    expect(mockMobileFetchJson).toHaveBeenCalledWith(
      "/api/mobile/staff/members/member-1",
      expect.objectContaining({
        body: JSON.stringify({ status: "paused" }),
        method: "PATCH",
      }),
    );
  });
});
