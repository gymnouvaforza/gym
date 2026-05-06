import { beforeEach, describe, expect, it, vi } from "vitest";

type TableRow = Record<string, unknown>;
type TableState = Record<string, TableRow[]>;

const serverMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  listAllFirebaseUsers: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: serverMocks.createSupabaseAdminClient,
}));

vi.mock("@/lib/firebase/server", () => ({
  getFirebaseAdminAuth: vi.fn(),
  listAllFirebaseUsers: serverMocks.listAllFirebaseUsers,
}));

vi.mock("@/lib/user-roles", async () => {
  const actual = await vi.importActual<typeof import("@/lib/user-roles")>("@/lib/user-roles");
  return {
    ...actual,
    listPersistedUserRoles: vi.fn().mockResolvedValue([]),
    listPersistedUserRolesForUser: vi.fn().mockResolvedValue([]),
  };
});

function createFakeClient(initialState: Partial<TableState>) {
  const state: TableState = {
    member_profiles: [],
    member_plan_snapshots: [],
    routine_assignments: [],
    routine_templates: [],
    trainer_profiles: [],
    ...initialState,
  };

  class QueryBuilder {
    private filters: Array<(row: TableRow) => boolean> = [];
    private sortField: string | null = null;
    private sortAscending = true;

    constructor(private readonly table: keyof TableState) {}

    select() {
      return this;
    }

    eq(field: string, value: unknown) {
      this.filters.push((row) => row[field] === value);
      return this;
    }

    neq(field: string, value: unknown) {
      this.filters.push((row) => row[field] !== value);
      return this;
    }

    in(field: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[field]));
      return this;
    }

    or(value: string) {
      const clauses = value
        .split(/(?<!\\),/)
        .map((clause) => clause.replace(/\\,/g, ",").trim())
        .filter(Boolean);

      this.filters.push((row) =>
        clauses.some((clause) => {
          const match = clause.match(/^([a-z_]+)\.ilike\.%(.*)%$/i);
          if (!match) {
            return false;
          }

          const field = match[1];
          const needle = match[2]
            .replace(/\\,/g, ",")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")")
            .toLowerCase();
          const valueToCheck = String(row[field] ?? "").toLowerCase();
          return valueToCheck.includes(needle);
        }),
      );
      return this;
    }

    order(field: string, options?: { ascending?: boolean }) {
      this.sortField = field;
      this.sortAscending = options?.ascending ?? true;
      return this;
    }

    then(resolve: (value: { data: TableRow[]; error: null }) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve({ data: this.runSelect(), error: null }).then(resolve, reject);
    }

    private runSelect() {
      const rows = state[this.table].filter((row) => this.filters.every((filter) => filter(row)));

      if (!this.sortField) {
        return rows;
      }

      return [...rows].sort((left, right) => {
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
  }

  return {
    from(table: keyof TableState) {
      return new QueryBuilder(table);
    },
  };
}

function createMemberRow(overrides: Partial<TableRow> = {}) {
  return {
    id: "member-1",
    supabase_user_id: null,
    trainer_user_id: null,
    member_number: "NF-001",
    full_name: "Titan Prime",
    email: "titan@test.com",
    phone: null,
    status: "active",
    branch_name: "Centro",
    notes: null,
    join_date: "2026-05-01",
    created_at: "2026-05-01T10:00:00.000Z",
    updated_at: "2026-05-02T10:00:00.000Z",
    external_code: "EXT-1",
    birth_date: null,
    gender: null,
    address: null,
    district_or_urbanization: null,
    occupation: null,
    preferred_schedule: null,
    legacy_notes: null,
    profile_completed: false,
    ...overrides,
  };
}

describe("listDashboardMembers member filters", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    serverMocks.listAllFirebaseUsers.mockResolvedValue([]);
  });

  it("excludes former members by default", async () => {
    serverMocks.createSupabaseAdminClient.mockReturnValue(
      createFakeClient({
        member_profiles: [
          createMemberRow({ id: "member-active", full_name: "Activo Uno", status: "active" }),
          createMemberRow({ id: "member-former", full_name: "Former Dos", status: "former" }),
        ],
      }),
    );

    const { listDashboardMembers } = await import("./gym-management");
    const members = await listDashboardMembers();

    expect(members.map((member) => member.id)).toEqual(["member-active"]);
  });

  it("keeps explicit status filtering", async () => {
    serverMocks.createSupabaseAdminClient.mockReturnValue(
      createFakeClient({
        member_profiles: [
          createMemberRow({ id: "member-paused", full_name: "Pausa Uno", status: "paused" }),
          createMemberRow({ id: "member-active", full_name: "Activo Dos", status: "active" }),
        ],
      }),
    );

    const { listDashboardMembers } = await import("./gym-management");
    const members = await listDashboardMembers({ status: "paused" });

    expect(members.map((member) => member.id)).toEqual(["member-paused"]);
  });

  it("trims search and matches by external code", async () => {
    serverMocks.createSupabaseAdminClient.mockReturnValue(
      createFakeClient({
        member_profiles: [
          createMemberRow({ id: "member-match", external_code: "VIP-7788", full_name: "Activo Uno" }),
          createMemberRow({ id: "member-miss", external_code: "OTHER-1", full_name: "Activo Dos" }),
        ],
      }),
    );

    const { listDashboardMembers } = await import("./gym-management");
    const members = await listDashboardMembers({ search: "  VIP-7788  " });

    expect(members.map((member) => member.id)).toEqual(["member-match"]);
  });

  it("escapes commas and parentheses in search without breaking matches", async () => {
    serverMocks.createSupabaseAdminClient.mockReturnValue(
      createFakeClient({
        member_profiles: [
          createMemberRow({
            id: "member-match",
            full_name: "Titan, Prime (A)",
            external_code: "EXT-(A)",
          }),
          createMemberRow({
            id: "member-miss",
            full_name: "Titan Prime B",
            external_code: "EXT-B",
          }),
        ],
      }),
    );

    const { listDashboardMembers } = await import("./gym-management");
    const members = await listDashboardMembers({ search: "Titan, Prime (A)" });

    expect(members.map((member) => member.id)).toEqual(["member-match"]);
  });
});
