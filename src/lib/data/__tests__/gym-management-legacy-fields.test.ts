// Focused coverage for legacy member profile fields handled by gym-management data helpers.
import { beforeEach, describe, expect, it, vi } from "vitest";

type TableRow = Record<string, unknown>;
type TableState = Record<string, TableRow[]>;
type QueryOperation = "insert" | "select" | "update";
type QueryFailures = Partial<Record<string, Partial<Record<QueryOperation, string>>>>;

const serverMocks = vi.hoisted(() => ({
  createSupabaseAdminClient: vi.fn(),
  getFirebaseAdminAuth: vi.fn(),
  listAllFirebaseUsers: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: serverMocks.createSupabaseAdminClient,
}));

vi.mock("@/lib/firebase/server", () => ({
  getFirebaseAdminAuth: serverMocks.getFirebaseAdminAuth,
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

function createFakeClient(initialState: Partial<TableState>, failures: QueryFailures = {}) {
  const state: TableState = {
    member_plan_snapshots: [],
    member_profiles: [],
    routine_assignments: [],
    routine_template_blocks: [],
    routine_template_exercises: [],
    routine_templates: [],
    trainer_profiles: [],
    ...initialState,
  };

  class QueryBuilder {
    private filters: Array<(row: TableRow) => boolean> = [];
    private operation: QueryOperation = "select";
    private payload: TableRow | TableRow[] | null = null;
    private shouldReturnSingle = false;
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

    or(expression: string) {
      // Handle escaped commas in PostgREST format
      const conditions: string[] = [];
      let current = "";
      let i = 0;
      while (i < expression.length) {
        if (expression[i] === "\\" && i + 1 < expression.length && expression[i + 1] === ",") {
          current += ",";
          i += 2;
        } else if (expression[i] === ",") {
          if (current.trim()) conditions.push(current.trim());
          current = "";
          i++;
        } else {
          current += expression[i];
          i++;
        }
      }
      if (current.trim()) conditions.push(current.trim());

      this.filters.push((row) =>
        conditions.some((condition) => {
          const match = condition.match(/^(.+?)\.ilike\.\%(.+?)\%$/);
          if (!match) return false;
          
          const [, field, pattern] = match;
          const normalizedPattern = pattern.toLowerCase();
          
          // Support phone normalization: match both original and digits-only
          if (field.trim() === "phone") {
            const phoneValue = String(row[field] ?? "").toLowerCase();
            const digitsOnly = phoneValue.replace(/\D/g, "");
            return phoneValue.includes(normalizedPattern) || digitsOnly.includes(normalizedPattern);
          }
          
          return String(row[field] ?? "")
            .toLowerCase()
            .includes(normalizedPattern);
        }),
      );
      return this;
    }

    order(field: string, options?: { ascending?: boolean }) {
      this.sortField = field;
      this.sortAscending = options?.ascending ?? true;
      return this;
    }

    update(payload: TableRow) {
      this.operation = "update";
      this.payload = payload;
      return this;
    }

    insert(payload: TableRow | TableRow[]) {
      this.operation = "insert";
      this.payload = payload;
      return this;
    }

    maybeSingle() {
      const failure = failures[this.table]?.select;
      if (failure) {
        return Promise.resolve({ data: null, error: { message: failure } });
      }

      const rows = this.runSelect();
      return Promise.resolve({ data: rows[0] ?? null, error: null });
    }

    single() {
      this.shouldReturnSingle = true;
      return Promise.resolve(this.execute());
    }

    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(this.execute()).then(resolve, reject);
    }

    private execute() {
      const configuredFailure = failures[this.table]?.[this.operation];
      if (configuredFailure) {
        return { data: null, error: { message: configuredFailure } };
      }

      if (this.operation === "update") {
        const rows = this.runSelect();
        for (const row of rows) {
          Object.assign(row, this.payload);
        }

        return { data: null, error: null };
      }

      if (this.operation === "insert") {
        const payloadRows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const insertedRows = payloadRows.map((row, index) => ({
          id: (row?.id as string | undefined) ?? `${String(this.table)}-${index + 1}`,
          ...row,
        }));
        state[this.table].push(...insertedRows);

        return {
          data: this.shouldReturnSingle ? insertedRows[0] ?? null : insertedRows,
          error: null,
        };
      }

      return { data: this.runSelect(), error: null };
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
    state,
  };
}

function buildMemberForm(overrides: Record<string, unknown> = {}) {
  return {
    address: "Av. Central 123",
    birthDate: "1990-05-15",
    branchName: "Centro",
    districtOrUrbanization: "Urb. Central",
    email: "member@novaforza.com",
    externalCode: "LEG-0001",
    fullName: "Legacy Member",
    gender: "M",
    joinDate: "2026-01-10",
    legacyNotes: "Ficha importada del sistema anterior.",
    linkedUserId: null,
    notes: "Nota operativa",
    occupation: "Entrenador",
    phone: "+51 999 888 777",
    planEndsAt: null,
    planLabel: "Plan Elite",
    planNotes: null,
    planStartedAt: "2026-01-10",
    planStatus: "active" as const,
    preferredSchedule: "Manana",
    profileCompleted: false,
    status: "active" as const,
    trainerUserId: null,
    ...overrides,
  };
}

describe("gym-management legacy member fields", () => {
  beforeEach(() => {
    vi.resetModules();
    serverMocks.createSupabaseAdminClient.mockReset();
    serverMocks.getFirebaseAdminAuth.mockReset();
    serverMocks.listAllFirebaseUsers.mockResolvedValue([]);
  });

  it("creates a member profile with all legacy fields and computes profile completion", async () => {
    const client = createFakeClient({});
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { createMemberProfile } = await import("../gym-management");

    await createMemberProfile(buildMemberForm());

    expect(client.state.member_profiles[0]).toEqual(
      expect.objectContaining({
        address: "Av. Central 123",
        birth_date: "1990-05-15",
        district_or_urbanization: "Urb. Central",
        external_code: "LEG-0001",
        gender: "M",
        legacy_notes: "Ficha importada del sistema anterior.",
        occupation: "Entrenador",
        preferred_schedule: "Manana",
        profile_completed: true,
      }),
    );
  });

  it("surfaces duplicate external_code errors from Supabase", async () => {
    const client = createFakeClient(
      {},
      {
        member_profiles: {
          insert: "duplicate key value violates unique constraint member_profiles_external_code_key",
        },
      },
    );
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { createMemberProfile } = await import("../gym-management");

    await expect(createMemberProfile(buildMemberForm())).rejects.toThrow(
      "member_profiles_external_code_key",
    );
  });

  it("computes profile_completed as false when required profile fields are missing", async () => {
    const client = createFakeClient({});
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { createMemberProfile } = await import("../gym-management");

    await createMemberProfile(
      buildMemberForm({
        birthDate: null,
        gender: null,
        phone: null,
        profileCompleted: true,
      }),
    );

    expect(client.state.member_profiles[0]).toEqual(
      expect.objectContaining({
        birth_date: null,
        gender: null,
        phone: null,
        profile_completed: false,
      }),
    );
  });

  it("updates legacy fields and recalculates profile completion", async () => {
    const client = createFakeClient({
      member_plan_snapshots: [
        {
          id: "plan-1",
          is_current: true,
          member_id: "member-1",
        },
      ],
      member_profiles: [
        {
          email: "old@novaforza.com",
          external_code: "OLD-001",
          full_name: "Old Member",
          id: "member-1",
          status: "prospect",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { updateMemberProfile } = await import("../gym-management");

    await updateMemberProfile("member-1", buildMemberForm({ externalCode: "LEG-0002" }));

    expect(client.state.member_profiles[0]).toEqual(
      expect.objectContaining({
        external_code: "LEG-0002",
        profile_completed: true,
      }),
    );
  });

  it("includes legacy fields in dashboard list items and searches by external code", async () => {
    const client = createFakeClient({
      member_profiles: [
        {
          address: "Av. Central 123",
          birth_date: "1990-05-15",
          branch_name: "Centro",
          created_at: "2026-01-10T10:00:00.000Z",
          district_or_urbanization: "Urb. Central",
          email: "member@novaforza.com",
          external_code: "LEG-0002",
          full_name: "Legacy Member",
          gender: "F",
          id: "member-1",
          join_date: "2026-01-10",
          legacy_notes: "Ficha antigua",
          member_number: "NF-0001",
          notes: null,
          occupation: "Nutricionista",
          phone: "+51 999 888 777",
          preferred_schedule: "Noche",
          profile_completed: true,
          status: "active",
          supabase_user_id: null,
          trainer_user_id: null,
          updated_at: "2026-01-11T10:00:00.000Z",
        },
        {
          created_at: "2026-01-09T10:00:00.000Z",
          email: "other@novaforza.com",
          external_code: "LEG-9999",
          full_name: "Other Member",
          id: "member-2",
          join_date: "2026-01-09",
          member_number: "NF-0002",
          status: "active",
          updated_at: "2026-01-09T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { listDashboardMembers } = await import("../gym-management");

    const members = await listDashboardMembers({ search: "LEG-0002" });

    expect(members).toHaveLength(1);
    expect(members[0]).toEqual(
      expect.objectContaining({
        address: "Av. Central 123",
        birthDate: "1990-05-15",
        districtOrUrbanization: "Urb. Central",
        externalCode: "LEG-0002",
        gender: "F",
        legacyNotes: "Ficha antigua",
        occupation: "Nutricionista",
        preferredSchedule: "Noche",
        profileCompleted: true,
      }),
    );
  });
});
