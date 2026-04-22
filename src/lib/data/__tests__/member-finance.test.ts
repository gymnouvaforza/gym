import { beforeEach, describe, expect, it, vi } from "vitest";

type TableRow = Record<string, unknown>;
type TableName =
  | "member_measurements"
  | "member_payments"
  | "member_profiles"
  | "membership_plans"
  | "memberships";
type TableState = Record<TableName, TableRow[]>;

const serverMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: serverMocks.createSupabaseAdminClient,
}));

function createFakeFinanceClient(
  initialState: Partial<TableState>,
  tableErrors: Partial<Record<TableName, string>> = {},
) {
  const state: TableState = {
    member_measurements: [],
    member_payments: [],
    member_profiles: [],
    membership_plans: [],
    memberships: [],
    ...initialState,
  };

  class QueryBuilder {
    private filters: Array<(row: TableRow) => boolean> = [];
    private operation: "insert" | "select" | "update" = "select";
    private payload: TableRow | TableRow[] | null = null;
    private selectShape: string | null = null;
    private shouldReturnSingle = false;
    private sortAscending = true;
    private sortField: string | null = null;
    private limitCount: number | null = null;

    constructor(private readonly table: TableName) {}

    select(shape?: string) {
      this.selectShape = shape ?? null;
      return this;
    }

    eq(field: string, value: unknown) {
      this.filters.push((row) => row[field] === value);
      return this;
    }

    order(field: string, options?: { ascending?: boolean }) {
      this.sortField = field;
      this.sortAscending = options?.ascending ?? true;
      return this;
    }

    limit(value: number) {
      this.limitCount = value;
      return this;
    }

    insert(payload: TableRow | TableRow[]) {
      this.operation = "insert";
      this.payload = payload;
      return this;
    }

    update(payload: TableRow) {
      this.operation = "update";
      this.payload = payload;
      return this;
    }

    single() {
      this.shouldReturnSingle = true;
      return Promise.resolve(this.execute());
    }

    maybeSingle() {
      const result = this.selectResult();
      return Promise.resolve({
        data: result[0] ?? null,
        error: this.resolveError(),
      });
    }

    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(this.execute()).then(resolve, reject);
    }

    private execute() {
      const error = this.resolveError();

      if (error) {
        return { data: null, error };
      }

      if (this.operation === "update") {
        const rows = this.baseRows();

        for (const row of rows) {
          Object.assign(row, this.payload);
        }

        return { data: null, error: null };
      }

      if (this.operation === "insert") {
        const payloadRows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted = payloadRows.map((row, index) => ({
          id: (row?.id as string | undefined) ?? `${this.table}-${state[this.table].length + index + 1}`,
          created_at: row?.created_at ?? "2026-04-22T10:00:00.000Z",
          recorded_at: row?.recorded_at ?? "2026-04-22T10:00:00.000Z",
          updated_at: row?.updated_at ?? "2026-04-22T10:00:00.000Z",
          ...row,
        }));
        state[this.table].push(...inserted);

        return {
          data: this.shouldReturnSingle ? inserted[0] ?? null : inserted,
          error: null,
        };
      }

      const result = this.selectResult();

      return {
        data: this.shouldReturnSingle ? result[0] ?? null : result,
        error: null,
      };
    }

    private resolveError() {
      const message = tableErrors[this.table];
      return message ? { message } : null;
    }

    private baseRows() {
      let rows = state[this.table].filter((row) => this.filters.every((filter) => filter(row)));

      if (this.sortField) {
        rows = [...rows].sort((left, right) => {
          const leftValue = left[this.sortField!] as string | number | null | undefined;
          const rightValue = right[this.sortField!] as string | number | null | undefined;

          if (leftValue === rightValue) {
            return 0;
          }

          if (leftValue == null) {
            return this.sortAscending ? 1 : -1;
          }

          if (rightValue == null) {
            return this.sortAscending ? -1 : 1;
          }

          return this.sortAscending
            ? String(leftValue).localeCompare(String(rightValue))
            : String(rightValue).localeCompare(String(leftValue));
        });
      }

      if (this.limitCount != null) {
        rows = rows.slice(0, this.limitCount);
      }

      return rows;
    }

    private selectResult() {
      const rows = this.baseRows();

      if (this.table !== "memberships" || !this.selectShape?.includes("membership_plans")) {
        return rows;
      }

      return rows.map((row) => ({
        ...row,
        membership_plans:
          state.membership_plans.find((plan) => plan.id === row.plan_id)
            ? { title: state.membership_plans.find((plan) => plan.id === row.plan_id)?.title }
            : null,
        member_payments: state.member_payments
          .filter((payment) => payment.membership_id === row.id)
          .sort((left, right) =>
            String(right.recorded_at).localeCompare(String(left.recorded_at)),
          ),
      }));
    }
  }

  return {
    from(table: TableName) {
      return new QueryBuilder(table);
    },
    state,
  };
}

describe("member-finance", () => {
  beforeEach(() => {
    vi.resetModules();
    serverMocks.createSupabaseAdminClient.mockReset();
  });

  it("returns null when member has no financial membership", async () => {
    const client = createFakeFinanceClient({});
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { getMemberFinancials } = await import("@/lib/data/member-finance");
    const result = await getMemberFinancials("member-1");

    expect(result).toBeNull();
  });

  it("maps latest membership and related payments into stable DTOs", async () => {
    const client = createFakeFinanceClient({
      membership_plans: [{ id: "plan-pro", title: "Plan Pro" }],
      memberships: [
        {
          id: "membership-old",
          member_id: "member-1",
          plan_id: "plan-pro",
          total_price: "99.90",
          balance_due: "10.40",
          manual_activation_status: "pending",
          start_date: "2026-03-01",
          end_date: "2026-03-31",
          created_at: "2026-03-01T08:00:00.000Z",
        },
        {
          id: "membership-new",
          member_id: "member-1",
          plan_id: "plan-pro",
          total_price: "120.50",
          balance_due: "20.25",
          manual_activation_status: "active",
          start_date: "2026-04-01",
          end_date: "2026-04-30",
          created_at: "2026-04-10T08:00:00.000Z",
        },
      ],
      member_payments: [
        {
          id: "payment-1",
          membership_id: "membership-new",
          amount_paid: "40.10",
          payment_method: "cash",
          reference_code: null,
          recorded_at: "2026-04-12T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { getMemberFinancials } = await import("@/lib/data/member-finance");
    const result = await getMemberFinancials("member-1");

    expect(result).toEqual({
      id: "membership-new",
      planTitle: "Plan Pro",
      totalPrice: 120.5,
      balanceDue: 20.25,
      status: "active",
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      payments: [
        {
          id: "payment-1",
          amountPaid: 40.1,
          paymentMethod: "cash",
          referenceCode: null,
          recordedAt: "2026-04-12T10:00:00.000Z",
        },
      ],
    });
  });

  it("returns empty measurement list when query fails", async () => {
    const client = createFakeFinanceClient({}, { member_measurements: "boom" });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { getMemberMeasurements } = await import("@/lib/data/member-finance");
    const result = await getMemberMeasurements("member-1");

    expect(result).toEqual([]);
  });

  it("registers payment, caps negative balances and activates when debt reaches zero", async () => {
    const client = createFakeFinanceClient({
      memberships: [
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          member_id: "member-1",
          plan_id: null,
          total_price: 120,
          balance_due: 30,
          manual_activation_status: "pending",
          created_at: "2026-04-10T08:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { registerMemberPayment } = await import("@/lib/data/member-finance");
    const result = await registerMemberPayment({
      membershipId: "550e8400-e29b-41d4-a716-446655440001",
      amount: 99,
      method: "cash",
      reference: "RC-1",
      memberName: "Socio Test",
      recordedByUserId: "admin-1",
    });

    expect(result.newBalance).toBe(0);
    expect(result.status).toBe("active");
    expect(client.state.member_payments).toEqual([
      expect.objectContaining({
        membership_id: "550e8400-e29b-41d4-a716-446655440001",
        amount_paid: 99,
        payment_method: "cash",
        recorded_by: "admin-1",
        reference_code: "RC-1",
      }),
    ]);
    expect(client.state.memberships[0]).toEqual(
      expect.objectContaining({
        balance_due: 0,
        manual_activation_status: "active",
      }),
    );
  });

  it("keeps membership pending when partial payment leaves remaining balance", async () => {
    const client = createFakeFinanceClient({
      memberships: [
        {
          id: "550e8400-e29b-41d4-a716-446655440002",
          member_id: "member-2",
          plan_id: null,
          total_price: 150,
          balance_due: 50,
          manual_activation_status: "pending",
          created_at: "2026-04-10T08:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { registerMemberPayment } = await import("@/lib/data/member-finance");
    const result = await registerMemberPayment({
      membershipId: "550e8400-e29b-41d4-a716-446655440002",
      amount: 20,
      method: "yape",
      reference: null,
      memberName: "Socio Test",
      recordedByUserId: null,
    });

    expect(result.newBalance).toBe(30);
    expect(result.status).toBe("pending");
  });
});
