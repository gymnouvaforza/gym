import { beforeEach, describe, expect, it, vi } from "vitest";

type FakeValue = string | number | boolean | null | undefined;
type FakeRow = Record<string, FakeValue>;
type FakeState = Record<string, FakeRow[]>;
type FakeSelectOptions = {
  count?: string;
  head?: boolean;
};
type FakeQueryResult = {
  count?: number;
  data: FakeRow[] | null;
  error: null;
};

const serverMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: serverMocks.createSupabaseAdminClient,
}));

function compareValues(left: FakeValue, right: FakeValue, mode: "eq" | "gte" | "lte") {
  if (mode === "eq") {
    return left === right;
  }

  if (left == null || right == null) {
    return false;
  }

  if (typeof left === "number" && typeof right === "number") {
    return mode === "gte" ? left >= right : left <= right;
  }

  const normalizedLeft = String(left);
  const normalizedRight = String(right);
  return mode === "gte"
    ? normalizedLeft >= normalizedRight
    : normalizedLeft <= normalizedRight;
}

function createFakeMetricsClient(state: FakeState) {
  return {
    from: (table: string) => ({
      select: (_shape: string, options: FakeSelectOptions) => {
        let data = state[table] || [];

        const builder = {
          eq: (field: string, value: FakeValue) => {
            data = data.filter((row) => compareValues(row[field], value, "eq"));
            return builder;
          },
          gte: (field: string, value: FakeValue) => {
            data = data.filter((row) => compareValues(row[field], value, "gte"));
            return builder;
          },
          lte: (field: string, value: FakeValue) => {
            data = data.filter((row) => compareValues(row[field], value, "lte"));
            return builder;
          },
          not: (field: string, op: string, value: FakeValue) => {
            if (op === "is" && value === null) {
              data = data.filter((row) => row[field] !== null);
            }
            return builder;
          },
          then: (resolve: (result: FakeQueryResult) => void) => {
            if (options?.count === "exact") {
              resolve({ data: options?.head ? null : data, count: data.length, error: null });
            } else {
              resolve({ data, error: null });
            }
          },
        };
        return builder;
      },
    }),
  };
}

describe("dashboard-metrics", () => {
  beforeEach(() => {
    vi.resetModules();
    serverMocks.createSupabaseAdminClient.mockReset();
  });

  it("calculates metrics correctly from Supabase data", async () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];

    const client = createFakeMetricsClient({
      membership_requests: [
        { status: "active", cycle_ends_on: todayStr, created_at: firstDayOfMonth },
        { status: "active", cycle_ends_on: "2099-01-01", created_at: firstDayOfMonth },
        { status: "expired", cycle_ends_on: "2020-01-01", created_at: "2020-01-01" },
      ],
      member_profiles: [
        { status: "frozen", created_at: firstDayOfMonth, birth_date: todayStr },
        { status: "active", created_at: firstDayOfMonth, birth_date: "1990-01-01" },
      ],
      membership_payment_entries: [
        { amount: 100, recorded_at: firstDayOfMonth },
        { amount: 50, recorded_at: firstDayOfMonth },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { getDashboardMetrics } = await import("../dashboard-metrics");
    const metrics = await getDashboardMetrics();

    expect(metrics.activeMembers).toBe(2);
    expect(metrics.expiredMembers).toBe(1);
    expect(metrics.frozenMembers).toBe(1);
    expect(metrics.monthlyIncome).toBe(150);
    // expiringToday should be 1
    expect(metrics.expiringToday).toBe(1);
    // newMembersThisMonth should be 2
    expect(metrics.newMembersThisMonth).toBe(2);
  });
});
