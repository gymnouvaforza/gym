// Tests for the member check-ins data layer using an in-memory Supabase client fake.
import { beforeEach, describe, expect, it, vi } from "vitest";



type TableRow = Record<string, unknown>;
type TableState = Record<string, TableRow[]>;
type QueryOperation = "delete" | "insert" | "select" | "update";
type QueryFailures = Partial<Record<string, Partial<Record<QueryOperation, string>>>>;

const serverMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: serverMocks.createSupabaseAdminClient,
}));

function createFakeClient(initialState: Partial<TableState>, failures: QueryFailures = {}) {
  const state: TableState = {
    member_checkins: [],
    member_profiles: [],
    membership_requests: [],
    memberships: [],
    membership_plans: [],
    member_payments: [],
    ...initialState,
  };
  let insertCount = 0;

  class QueryBuilder {
    private filters: Array<(row: TableRow) => boolean> = [];
    private operation: QueryOperation = "select";
    private payload: TableRow | TableRow[] | null = null;
    private shouldReturnSingle = false;
    private sortField: string | null = null;
    private sortAscending = true;
    private selectShape: string | null = null;
    private limitCount: number | null = null;
    private gteFilter: { field: string; value: unknown } | null = null;
    private ltFilter: { field: string; value: unknown } | null = null;

    constructor(private readonly table: keyof TableState) {}

    delete() {
      this.operation = "delete";
      return this;
    }

    eq(field: string, value: unknown) {
      this.filters.push((row) => row[field] === value);
      return this;
    }

    gte(field: string, value: unknown) {
      this.gteFilter = { field, value };
      return this;
    }

    lt(field: string, value: unknown) {
      this.ltFilter = { field, value };
      return this;
    }

    insert(payload: TableRow | TableRow[]) {
      this.operation = "insert";
      this.payload = payload;
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

    select(shape?: string) {
      this.selectShape = shape ?? null;
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

    update(payload: TableRow) {
      this.operation = "update";
      this.payload = payload;
      return this;
    }

    or(_condition: string) {
      // Parse OR conditions for name/email/phone/member_number/external_code search
      // Supports format: field1.ilike.%term1%,field2.ilike.%term2%,...
      // Handles escaped commas: \, should not be treated as separator
      
      // Split by comma but respect escaped commas (\,)
      const conditions: string[] = [];
      let current = "";
      let i = 0;
      while (i < _condition.length) {
        if (_condition[i] === "\\" && i + 1 < _condition.length && _condition[i + 1] === ",") {
          // Escaped comma - keep the comma, skip the backslash
          current += ",";
          i += 2;
        } else if (_condition[i] === ",") {
          // Unescaped comma - end of condition
          if (current.trim()) conditions.push(current.trim());
          current = "";
          i++;
        } else {
          current += _condition[i];
          i++;
        }
      }
      if (current.trim()) conditions.push(current.trim());
      
      this.filters.push((row) => {
        return conditions.some((condition) => {
          // Extract field and search term from "field.ilike.%term%"
          // Term may contain unescaped % and other chars
          const match = condition.match(/^(.+?)\.ilike\.\%(.+?)\%$/);
          if (!match) return false;
          
          const [, field, searchTerm] = match;
          const normalizedSearch = searchTerm.toLowerCase();
          
          // Get row value based on field name
          let rowValue: string;
          switch (field.trim()) {
            case "full_name":
              rowValue = String(row.full_name ?? "").toLowerCase();
              break;
            case "email":
              rowValue = String(row.email ?? "").toLowerCase();
              break;
            case "phone":
              rowValue = String(row.phone ?? "").toLowerCase();
              // Support phone normalization: match both original and digits-only
              const digitsOnly = rowValue.replace(/\D/g, "");
              return rowValue.includes(normalizedSearch) || digitsOnly.includes(normalizedSearch);
            case "member_number":
              rowValue = String(row.member_number ?? "").toLowerCase();
              break;
            case "external_code":
              rowValue = String(row.external_code ?? "").toLowerCase();
              break;
            default:
              return false;
          }
          
          return rowValue.includes(normalizedSearch);
        });
      });
      return this;
    }

    private execute() {
      const configuredFailure = failures[String(this.table)]?.[this.operation];
      if (configuredFailure) {
        return { data: null, error: { message: configuredFailure } };
      }

      if (this.operation === "insert") {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const insertedRows = rows.map((row) => {
          insertCount += 1;
          return {
            created_at: `2026-05-05T10:00:0${insertCount}.000Z`,
            id: `${String(this.table)}-${insertCount}`,
            ...row,
          };
        });
        state[this.table].push(...insertedRows);
        return {
          data: this.shouldReturnSingle ? insertedRows[0] ?? null : insertedRows,
          error: null,
        };
      }

      if (this.operation === "update") {
        const rows = this.runSelect();
        for (const row of rows) {
          Object.assign(row, this.payload);
        }
        return { data: null, error: null };
      }

      if (this.operation === "delete") {
        const rowsToDelete = this.runSelect();
        state[this.table] = state[this.table].filter((row) => !rowsToDelete.includes(row));
        return { data: rowsToDelete, error: null };
      }

      const result = this.selectResult();
      return {
        data: this.shouldReturnSingle ? result[0] ?? null : result,
        error: null,
      };
    }

    private selectResult() {
      const rows = this.runSelect();
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

    private resolveError() {
      const configuredFailure = failures[String(this.table)]?.[this.operation];
      return configuredFailure ? { message: configuredFailure } : null;
    }

    private runSelect() {
      let rows = state[this.table].filter((row) => {
        if (this.gteFilter && (row[this.gteFilter.field] as string | number) < (this.gteFilter.value as string | number)) return false;
        if (this.ltFilter && (row[this.ltFilter.field] as string | number) >= (this.ltFilter.value as string | number)) return false;
        return this.filters.every((filter) => filter(row));
      });

      if (this.sortField) {
        rows = [...rows].sort((left, right) => {
          const leftValue = left[this.sortField!] as string | number | null | undefined;
          const rightValue = right[this.sortField!] as string | number | null | undefined;
          if (leftValue === rightValue) return 0;
          if (leftValue == null) return this.sortAscending ? 1 : -1;
          if (rightValue == null) return this.sortAscending ? -1 : 1;
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
  }

  return {
    from(table: keyof TableState) {
      return new QueryBuilder(table);
    },
    state,
  };
}

describe("member-checkins data layer", () => {
  beforeEach(() => {
    vi.resetModules();
    serverMocks.createSupabaseAdminClient.mockReset();
  });

  it("searches members by name, phone, email or member number", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: "999888777", member_number: "NF-001", status: "active", branch_name: null, notes: null },
        { id: "m2", full_name: "Maria Lopez", email: "maria@test.com", phone: "999888666", member_number: "NF-002", status: "active", branch_name: null, notes: null },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const results = await searchReceptionMembers("Juan");
    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe("Juan Perez");
  });

  it("returns empty array for empty query", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({});
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const results = await searchReceptionMembers("  ");
    expect(results).toEqual([]);
  });

  it("snapshot for member without membership shows no_membership", async () => {
    const { getReceptionMemberSnapshot } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: null, member_number: "NF-001", status: "active", branch_name: null, notes: null },
      ],
      memberships: [],
      membership_requests: [],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const snapshot = await getReceptionMemberSnapshot("m1");
    expect(snapshot).not.toBeNull();
    expect(snapshot!.access.status).toBe("no_membership");
    expect(snapshot!.membership.planTitle).toBeNull();
    expect(snapshot!.recentCheckins).toEqual([]);
  });

  it("snapshot for active member with future end date shows active", async () => {
    const { getReceptionMemberSnapshot } = await import("@/lib/data/member-checkins");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: null, member_number: "NF-001", status: "active", branch_name: null, notes: null },
      ],
      memberships: [
        {
          id: "mem1",
          member_id: "m1",
          plan_id: "plan1",
          total_price: 100,
          balance_due: 0,
          manual_activation_status: "active",
          start_date: "2026-01-01",
          end_date: futureDate.toISOString().slice(0, 10),
        },
      ],
      membership_plans: [{ id: "plan1", title: "Plan Pro" }],
      member_payments: [],
      membership_requests: [],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const snapshot = await getReceptionMemberSnapshot("m1");
    expect(snapshot).not.toBeNull();
    expect(snapshot!.access.status).toBe("active");
    expect(snapshot!.membership.planTitle).toBe("Plan Pro");
  });

  it("snapshot for expired member shows expired", async () => {
    const { getReceptionMemberSnapshot } = await import("@/lib/data/member-checkins");
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: null, member_number: "NF-001", status: "active", branch_name: null, notes: null },
      ],
      memberships: [
        {
          id: "mem1",
          member_id: "m1",
          total_price: 100,
          balance_due: 20,
          manual_activation_status: "expired",
          start_date: "2026-01-01",
          end_date: pastDate.toISOString().slice(0, 10),
        },
      ],
      membership_requests: [],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const snapshot = await getReceptionMemberSnapshot("m1");
    expect(snapshot).not.toBeNull();
    expect(snapshot!.access.status).toBe("expired");
  });

  it("creates checkin with correct status snapshot and valid until", async () => {
    const { createMemberCheckin } = await import("@/lib/data/member-checkins");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const endDateStr = futureDate.toISOString().slice(0, 10);
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: null, member_number: "NF-001", status: "active", branch_name: null, notes: null },
      ],
      memberships: [
        {
          id: "mem1",
          member_id: "m1",
          total_price: 100,
          balance_due: 0,
          manual_activation_status: "active",
          start_date: "2026-01-01",
          end_date: endDateStr,
        },
      ],
      membership_requests: [],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const checkin = await createMemberCheckin({ memberId: "m1", method: "manual" });
    expect(checkin.status_snapshot).toBe("active");
    expect(checkin.membership_valid_until).toBe(endDateStr);
    expect(checkin.method).toBe("manual");
    expect(client.state.member_checkins).toHaveLength(1);
  });

  it("lists today checkins sorted desc", async () => {
    const { listTodayMemberCheckins } = await import("@/lib/data/member-checkins");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", member_number: "NF-001" },
      ],
      member_checkins: [
        {
          id: "c1",
          member_id: "m1",
          checked_in_at: new Date(today.getTime() + 3600000).toISOString(),
          status_snapshot: "active",
          method: "manual",
          registered_by_email: "admin@test.com",
        },
        {
          id: "c2",
          member_id: "m1",
          checked_in_at: new Date(today.getTime() + 7200000).toISOString(),
          status_snapshot: "active",
          method: "manual",
          registered_by_email: null,
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const results = await listTodayMemberCheckins();
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("c2");
    expect(results[1].id).toBe("c1");
  });

  it("lists recent checkins limited and sorted desc", async () => {
    const { listRecentMemberCheckins } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", member_number: "NF-001" },
        { id: "m2", full_name: "Maria Lopez", member_number: "NF-002" },
      ],
      member_checkins: [
        {
          id: "c1",
          member_id: "m1",
          checked_in_at: "2026-05-01T10:00:00.000Z",
          status_snapshot: "active",
          method: "manual",
          registered_by_email: "admin@test.com",
        },
        {
          id: "c2",
          member_id: "m2",
          checked_in_at: "2026-05-03T10:00:00.000Z",
          status_snapshot: "expired",
          method: "qr",
          registered_by_email: null,
        },
        {
          id: "c3",
          member_id: "m1",
          checked_in_at: "2026-05-05T10:00:00.000Z",
          status_snapshot: "active",
          method: "reception",
          registered_by_email: "admin@test.com",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const results = await listRecentMemberCheckins(2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("c3");
    expect(results[1].id).toBe("c2");
  });

  it("lists member checkins limited and sorted", async () => {
    const { listMemberCheckins } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", member_number: "NF-001" },
      ],
      member_checkins: [
        { id: "c1", member_id: "m1", checked_in_at: "2026-05-01T10:00:00.000Z", status_snapshot: "active", method: "manual" },
        { id: "c2", member_id: "m1", checked_in_at: "2026-05-02T10:00:00.000Z", status_snapshot: "active", method: "qr" },
        { id: "c3", member_id: "m1", checked_in_at: "2026-05-03T10:00:00.000Z", status_snapshot: "expired", method: "manual" },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const results = await listMemberCheckins("m1", 2);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe("c3");
    expect(results[1].id).toBe("c2");
  });

  // Edge case tests for Bug B-001 fix
  it("searches members with apostrophe in name", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "O'Connor, Juan", email: "juan@test.com", phone: "999888777", member_number: "NF-001", external_code: "NF-001", status: "active", branch_name: null, notes: null },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    // Should find member even with apostrophe in search term
    const results = await searchReceptionMembers("O'Connor");
    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe("O'Connor, Juan");
  });

  it("searches members with comma in name", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Perez, Juan", email: "juan@test.com", phone: "999888777", member_number: "NF-001", external_code: "NF-001", status: "active", branch_name: null, notes: null },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    // Should find member even with comma in search term
    const results = await searchReceptionMembers("Perez, Juan");
    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe("Perez, Juan");
  });

  it("searches members by phone without spaces (normalization)", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: "+51 999 888 777", member_number: "NF-001", external_code: "NF-001", status: "active", branch_name: null, notes: null },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    // Should find member when searching with digits only (no spaces, no +)
    const results = await searchReceptionMembers("51999888777");
    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe("Juan Perez");
  });

  it("searches members by external_code", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    const client = createFakeClient({
      member_profiles: [
        { id: "m1", full_name: "Juan Perez", email: "juan@test.com", phone: "999888777", member_number: "NF-001", external_code: "LEGACY-123", status: "active", branch_name: null, notes: null },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    // Should find member by external_code
    const results = await searchReceptionMembers("LEGACY-123");
    expect(results).toHaveLength(1);
    expect(results[0].fullName).toBe("Juan Perez");
  });

  it("returns max 20 results", async () => {
    const { searchReceptionMembers } = await import("@/lib/data/member-checkins");
    
    // Create 25 members
    const manyMembers = Array.from({ length: 25 }, (_, i) => ({
      id: `m${i}`,
      full_name: `User ${i}`,
      email: `user${i}@test.com`,
      phone: `999888${String(i).padStart(3, "0")}`,
      member_number: `NF-${String(i).padStart(3, "0")}`,
      external_code: `EXT-${String(i).padStart(3, "0")}`,
      status: "active",
      branch_name: null,
      notes: null,
    }));
    
    const client = createFakeClient({
      member_profiles: manyMembers,
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    // Search for "User" which should match all 25
    const results = await searchReceptionMembers("User");
    expect(results.length).toBeLessThanOrEqual(20);
  });
});
