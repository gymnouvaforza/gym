import { beforeEach, describe, expect, it, vi } from "vitest";

type TableRow = Record<string, unknown>;
type TableState = Record<string, TableRow[]>;
type QueryOperation = "delete" | "insert" | "select" | "update";
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
    member_commerce_customers: [],
    membership_requests: [],
    member_plan_snapshots: [],
    member_profiles: [],
    member_routine_exercise_feedback: [],
    member_routine_feedback: [],
    pickup_request: [],
    routine_assignments: [],
    routine_template_blocks: [],
    routine_template_exercises: [],
    routine_templates: [],
    trainer_profiles: [],
    user_roles: [],
    ...initialState,
  };

  class QueryBuilder {
    private filters: Array<(row: TableRow) => boolean> = [];
    private insertedRows: TableRow[] = [];
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

    in(field: string, values: unknown[]) {
      this.filters.push((row) => values.includes(row[field]));
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

    delete() {
      this.operation = "delete";
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
        return Promise.resolve({
          data: null,
          error: { message: failure },
        });
      }

      const rows = this.runSelect();
      return Promise.resolve({
        data: rows[0] ?? null,
        error: null,
      });
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
        return {
          data: null,
          error: { message: configuredFailure },
        };
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
        this.insertedRows = payloadRows.map((row, index) => ({
          id: (row?.id as string | undefined) ?? `${String(this.table)}-${index + 1}`,
          ...row,
        }));
        state[this.table].push(...this.insertedRows);

        return {
          data: this.shouldReturnSingle ? this.insertedRows[0] ?? null : this.insertedRows,
          error: null,
        };
      }

      if (this.operation === "delete") {
        const rowsToDelete = this.runSelect();
        state[this.table] = state[this.table].filter((row) => !rowsToDelete.includes(row));

        return {
          data: this.shouldReturnSingle ? rowsToDelete[0] ?? null : rowsToDelete,
          error: null,
        };
      }

      return {
        data: this.runSelect(),
        error: null,
      };
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
    auth: {
      admin: {
        getUserById: vi.fn(async (userId: string) => ({
          data: {
            user: {
              email: `${userId}@novaforza.com`,
              id: userId,
              user_metadata: {},
            },
          },
          error: null,
        })),
        listUsers: vi.fn(async () => ({
          data: { users: [] },
          error: null,
        })),
      },
    },
    from(table: keyof TableState) {
      return new QueryBuilder(table);
    },
    state,
  };
}

describe("gym-management live mobile helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    serverMocks.listAllFirebaseUsers.mockResolvedValue([]);
    serverMocks.getFirebaseAdminAuth.mockReturnValue({
      deleteUser: vi.fn(async () => undefined),
      getUser: vi.fn(async (userId: string) => ({
        uid: userId,
        email: `${userId}@novaforza.com`,
        emailVerified: true,
        displayName: userId,
        metadata: {
          creationTime: null,
          lastSignInTime: null,
        },
        providerData: [],
      })),
      getUserByEmail: vi.fn(async (email: string) => ({
        uid: "user-by-email",
        email: email,
        emailVerified: true,
        displayName: email.split("@")[0],
        metadata: {
          creationTime: null,
          lastSignInTime: null,
        },
        providerData: [],
      })),
    });
  });

  it("bootstraps a member profile when the auth user has no profile yet", async () => {
    const client = createFakeClient({});
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { getLiveMobileSession } = await import("./gym-management");

    const session = await getLiveMobileSession(
      {
        app_metadata: {},
        email: "nomember@novaforza.com",
        id: "user-1",
        user_metadata: {},
      } as never,
      "member",
    );

    expect(session.member).toEqual(
      expect.objectContaining({
        email: "nomember@novaforza.com",
        fullName: "Nomember",
        planLabel: "Sin plan",
        status: "prospect",
      }),
    );
    expect(session.hasActiveRoutine).toBe(false);
    expect(session.role).toBe("member");
    expect(client.state.member_profiles).toHaveLength(1);
    expect(client.state.member_profiles[0]).toEqual(
      expect.objectContaining({
        email: "nomember@novaforza.com",
        status: "prospect",
        supabase_user_id: "user-1",
        trainer_user_id: null,
      }),
    );
    expect(client.state.member_plan_snapshots).toEqual([]);
  });

  it("reuses the existing member profile without creating duplicates", async () => {
    const client = createFakeClient({
      member_profiles: [
        {
          branch_name: "Centro",
          created_at: "2026-04-01T10:00:00.000Z",
          email: "member@novaforza.com",
          full_name: "Existing Member",
          id: "member-1",
          join_date: "2026-01-10",
          member_number: "NF-0001",
          notes: null,
          phone: null,
          status: "active",
          supabase_user_id: "user-1",
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { getLiveMobileSession } = await import("./gym-management");

    const session = await getLiveMobileSession(
      {
        app_metadata: { full_name: "Should Not Replace" },
        email: "member@novaforza.com",
        id: "user-1",
        user_metadata: {},
      } as never,
      "member",
    );

    expect(client.state.member_profiles).toHaveLength(1);
    expect(session.member).toEqual(
      expect.objectContaining({
        fullName: "Existing Member",
        id: "member-1",
        status: "active",
      }),
    );
  });

  it("relinks the operational profile by email when a blank linked profile already exists", async () => {
    const client = createFakeClient({
      member_plan_snapshots: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          ends_at: null,
          id: "plan-1",
          is_current: true,
          label: "Elite",
          member_id: "member-real",
          notes: null,
          started_at: "2026-03-01",
          status: "active",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      member_profiles: [
        {
          branch_name: null,
          created_at: "2026-04-02T10:00:00.000Z",
          email: "member@novaforza.com",
          full_name: "Blank Prospect",
          id: "member-blank",
          join_date: "2026-04-02",
          member_number: "NF-9999",
          notes: null,
          phone: null,
          status: "prospect",
          supabase_user_id: "user-1",
          trainer_user_id: null,
          updated_at: "2026-04-02T10:00:00.000Z",
        },
        {
          branch_name: "Centro",
          created_at: "2026-03-01T10:00:00.000Z",
          email: "member@novaforza.com",
          full_name: "Real Member",
          id: "member-real",
          join_date: "2026-03-01",
          member_number: "NF-0002",
          notes: null,
          phone: null,
          status: "active",
          supabase_user_id: null,
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_assignments: [
        {
          assigned_at: "2026-04-01T10:00:00.000Z",
          assigned_by_user_id: "trainer-1",
          created_at: "2026-04-01T10:00:00.000Z",
          ends_on: null,
          id: "assignment-1",
          member_id: "member-real",
          notes: null,
          routine_template_id: "template-1",
          starts_on: "2026-04-01",
          status: "active",
          trainer_user_id: "trainer-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_templates: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          created_by: null,
          difficulty_label: "Media",
          duration_label: "6 semanas",
          goal: "Fuerza",
          id: "template-1",
          intensity_label: "Media",
          is_active: true,
          notes: null,
          slug: "fuerza-base",
          status_label: "Activa",
          summary: "Resumen",
          title: "Fuerza base",
          trainer_user_id: "trainer-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { getLiveMobileSession } = await import("./gym-management");

    const session = await getLiveMobileSession(
      {
        app_metadata: {},
        email: "member@novaforza.com",
        id: "user-1",
        user_metadata: {},
      } as never,
      "member",
    );

    expect(session.member).toEqual(
      expect.objectContaining({
        currentRoutineTitle: "Fuerza base",
        id: "member-real",
        planLabel: "Elite",
      }),
    );
    expect(session.hasActiveRoutine).toBe(true);
    expect(client.state.member_profiles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "member-real",
          supabase_user_id: "user-1",
        }),
        expect.objectContaining({
          id: "member-blank",
          supabase_user_id: null,
        }),
      ]),
    );
  });

  it("returns null for live routine when the member has no active assignment", async () => {
    const client = createFakeClient({
      routine_assignments: [
        {
          assigned_at: "2026-04-01T10:00:00.000Z",
          assigned_by_user_id: "trainer-1",
          created_at: "2026-04-01T10:00:00.000Z",
          ends_on: "2026-04-10",
          id: "assignment-1",
          member_id: "member-1",
          notes: null,
          routine_template_id: "template-1",
          starts_on: "2026-04-01",
          status: "archived",
          trainer_user_id: "trainer-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { getLiveRoutineForSession } = await import("./gym-management");

    const routine = await getLiveRoutineForSession({
      displayName: "Nova Tester",
      email: "tester@novaforza.com",
      hasActiveRoutine: false,
      member: {
        branchName: "Centro",
        currentRoutineTitle: null,
        email: "tester@novaforza.com",
        fullName: "Nova Tester",
        id: "member-1",
        joinDate: "2026-01-10",
        memberNumber: "NF-0001",
        nextActionLabel: "Asignar rutina",
        planLabel: "Elite",
        status: "active",
      },
      role: "member",
      staffAccessLevel: null,
      userId: "user-1",
    });

    expect(routine).toBeNull();
  });

  it("hydrates the active routine with recommended schedule and member feedback", async () => {
    const client = createFakeClient({
      member_routine_exercise_feedback: [
        {
          created_at: "2026-04-02T10:00:00.000Z",
          id: "exercise-feedback-1",
          liked: true,
          member_id: "member-1",
          note: "Se siente muy bien.",
          routine_assignment_id: "assignment-1",
          routine_template_exercise_id: "exercise-1",
          updated_at: "2026-04-02T10:00:00.000Z",
        },
      ],
      member_routine_feedback: [
        {
          created_at: "2026-04-02T10:00:00.000Z",
          id: "routine-feedback-1",
          liked: true,
          member_id: "member-1",
          note: "Buen horario para entrenar.",
          routine_assignment_id: "assignment-1",
          updated_at: "2026-04-02T10:00:00.000Z",
        },
      ],
      routine_assignments: [
        {
          assigned_at: "2026-04-01T10:00:00.000Z",
          assigned_by_user_id: "trainer-1",
          created_at: "2026-04-01T10:00:00.000Z",
          ends_on: "2026-05-01",
          id: "assignment-1",
          member_id: "member-1",
          notes: null,
          recommended_schedule_label: "Lun/Mie/Vie · 19:00",
          routine_template_id: "template-1",
          starts_on: "2026-04-01",
          status: "active",
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_template_blocks: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          description: "Trabajo principal",
          id: "block-1",
          routine_template_id: "template-1",
          sort_order: 0,
          title: "Dia 1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_template_exercises: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          id: "exercise-1",
          name: "Back squat",
          notes: "Tempo controlado",
          reps_label: "5",
          rest_seconds: 120,
          routine_block_id: "block-1",
          sets_label: "4",
          sort_order: 0,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_templates: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          created_by: null,
          difficulty_label: "Media",
          duration_label: "6 semanas",
          goal: "Fuerza general",
          id: "template-1",
          intensity_label: "Media",
          is_active: true,
          notes: null,
          slug: "fuerza-base",
          status_label: "Activa",
          summary: "Base de fuerza para volver a ritmo.",
          title: "Fuerza base",
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { getLiveRoutineForSession } = await import("./gym-management");

    const routine = await getLiveRoutineForSession({
      displayName: "Nova Tester",
      email: "tester@novaforza.com",
      hasActiveRoutine: true,
      member: {
        branchName: "Centro",
        currentRoutineTitle: "Fuerza base",
        email: "tester@novaforza.com",
        fullName: "Nova Tester",
        id: "member-1",
        joinDate: "2026-01-10",
        memberNumber: "NF-0001",
        nextActionLabel: "Ver rutina activa",
        planLabel: "Elite",
        status: "active" as const,
      },
      role: "member",
      staffAccessLevel: null,
      userId: "user-1",
    });

    expect(routine).toEqual(
      expect.objectContaining({
        liked: true,
        memberNote: "Buen horario para entrenar.",
        recommendedScheduleLabel: "Lun/Mie/Vie · 19:00",
        startsOn: "2026-04-01",
      }),
    );
    expect(routine?.blocks[0]?.exercises[0]).toEqual(
      expect.objectContaining({
        liked: true,
        memberNote: "Se siente muy bien.",
        name: "Back squat",
      }),
    );
  });

  it("upserts routine feedback for the active assignment without duplicating rows", async () => {
    const client = createFakeClient({
      routine_assignments: [
        {
          assigned_at: "2026-04-01T10:00:00.000Z",
          assigned_by_user_id: "trainer-1",
          created_at: "2026-04-01T10:00:00.000Z",
          ends_on: null,
          id: "assignment-1",
          member_id: "member-1",
          notes: null,
          recommended_schedule_label: null,
          routine_template_id: "template-1",
          starts_on: "2026-04-01",
          status: "active",
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_template_blocks: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          description: null,
          id: "block-1",
          routine_template_id: "template-1",
          sort_order: 0,
          title: "Dia 1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_template_exercises: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          id: "exercise-1",
          name: "Back squat",
          notes: null,
          reps_label: "5",
          rest_seconds: 120,
          routine_block_id: "block-1",
          sets_label: "4",
          sort_order: 0,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_templates: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          created_by: null,
          difficulty_label: "Media",
          duration_label: "6 semanas",
          goal: "Fuerza general",
          id: "template-1",
          intensity_label: "Media",
          is_active: true,
          notes: null,
          slug: "fuerza-base",
          status_label: "Activa",
          summary: "Base de fuerza para volver a ritmo.",
          title: "Fuerza base",
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { updateLiveRoutineFeedbackForSession } = await import("./gym-management");
    const session = {
      displayName: "Nova Tester",
      email: "tester@novaforza.com",
      hasActiveRoutine: true,
      member: {
        branchName: "Centro",
        currentRoutineTitle: "Fuerza base",
        email: "tester@novaforza.com",
        fullName: "Nova Tester",
        id: "member-1",
        joinDate: "2026-01-10",
        memberNumber: "NF-0001",
        nextActionLabel: "Ver rutina activa",
        planLabel: "Elite",
        status: "active" as const,
      },
      role: "member" as const,
      staffAccessLevel: null,
      userId: "user-1",
    };

    await updateLiveRoutineFeedbackForSession(session, {
      liked: true,
      note: "Muy buena rutina.",
    });
    await updateLiveRoutineFeedbackForSession(session, {
      liked: false,
      note: "Prefiero otro horario.",
    });

    expect(client.state.member_routine_feedback).toHaveLength(1);
    expect(client.state.member_routine_feedback[0]).toEqual(
      expect.objectContaining({
        liked: false,
        member_id: "member-1",
        note: "Prefiero otro horario.",
        routine_assignment_id: "assignment-1",
      }),
    );
  });

  it("maps archived routine history into stable DTO output", async () => {
    const client = createFakeClient({
      routine_assignments: [
        {
          assigned_at: "2026-04-01T10:00:00.000Z",
          assigned_by_user_id: "trainer-1",
          created_at: "2026-04-01T10:00:00.000Z",
          ends_on: "2026-04-10",
          id: "assignment-1",
          member_id: "member-1",
          notes: null,
          routine_template_id: "template-1",
          starts_on: "2026-04-01",
          status: "archived",
          trainer_user_id: "trainer-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_templates: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          created_by: null,
          difficulty_label: "Media",
          duration_label: "6 semanas",
          goal: "Fuerza",
          id: "template-1",
          intensity_label: "Media",
          is_active: true,
          notes: null,
          slug: "fuerza-base",
          status_label: "Activa",
          summary: "Resumen",
          title: "Fuerza base",
          trainer_user_id: "trainer-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { getLiveHistoryForSession } = await import("./gym-management");

    const history = await getLiveHistoryForSession({
      displayName: "Nova Tester",
      email: "tester@novaforza.com",
      hasActiveRoutine: false,
      member: {
        branchName: "Centro",
        currentRoutineTitle: null,
        email: "tester@novaforza.com",
        fullName: "Nova Tester",
        id: "member-1",
        joinDate: "2026-01-10",
        memberNumber: "NF-0001",
        nextActionLabel: "Asignar rutina",
        planLabel: "Elite",
        status: "active",
      },
      role: "member",
      staffAccessLevel: null,
      userId: "user-1",
    });

    expect(history.items).toEqual([
      expect.objectContaining({
        id: "assignment-1",
        metricValue: "ARCHIVADA",
        title: "Fuerza base",
      }),
    ]);
  });

  it("updates member profiles from mobile with validated payloads", async () => {
    const client = createFakeClient({
      member_profiles: [
        {
          branch_name: "Centro",
          created_at: "2026-04-01T10:00:00.000Z",
          email: "tester@novaforza.com",
          full_name: "Nova Tester",
          id: "member-1",
          join_date: "2026-01-10",
          member_number: "NF-0001",
          notes: null,
          phone: null,
          status: "active",
          supabase_user_id: "user-1",
          trainer_user_id: null,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { updateLiveMemberFromMobile } = await import("./gym-management");

    await updateLiveMemberFromMobile("member-1", {
      branchName: "Norte",
      notes: "Control mensual",
      status: "paused",
    });

    expect(client.state.member_profiles[0]).toEqual(
      expect.objectContaining({
        branch_name: "Norte",
        notes: "Control mensual",
        status: "paused",
      }),
    );
  });

  it("deletes the linked auth account for a normal member when removing the profile", async () => {
    const client = createFakeClient({
      member_commerce_customers: [
        {
          email: "member@novaforza.com",
          id: "bridge-1",
          medusa_customer_id: "mc_1",
          supabase_user_id: "user-1",
        },
      ],
      membership_requests: [
        {
          id: "membership-1",
          supabase_user_id: "user-1",
        },
      ],
      member_profiles: [
        {
          email: "member@novaforza.com",
          full_name: "Member One",
          id: "member-1",
          status: "active",
          supabase_user_id: "user-1",
        },
      ],
      pickup_request: [
        {
          id: "pickup-1",
          supabase_user_id: "user-1",
        },
      ],
      user_roles: [
        {
          role: "app_blocked",
          user_id: "user-1",
        },
      ],
    });
    const deleteUser = vi.fn(async () => undefined);
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    serverMocks.getFirebaseAdminAuth.mockReturnValue({
      deleteUser,
      getUser: vi.fn(async () => ({
        uid: "user-1",
        email: "member@novaforza.com",
      })),
      getUserByEmail: vi.fn(async () => ({
        uid: "user-1",
        email: "member@novaforza.com",
      })),
    });

    const { listPersistedUserRolesForUser } = await import("@/lib/user-roles");
    vi.mocked(listPersistedUserRolesForUser).mockResolvedValue([]);

    const { deleteMemberProfile } = await import("./gym-management");
    await deleteMemberProfile("member-1");

    expect(deleteUser).toHaveBeenCalledWith("user-1");
    expect(client.state.member_profiles).toHaveLength(0);
    expect(client.state.member_commerce_customers).toHaveLength(0);
    expect(client.state.membership_requests[0]).toEqual(
      expect.objectContaining({ supabase_user_id: null }),
    );
    expect(client.state.pickup_request[0]).toEqual(
      expect.objectContaining({ supabase_user_id: null }),
    );
    expect(client.state.user_roles).toHaveLength(0);
  });

  it("still deletes the member profile if the Firebase user is not found", async () => {
    const client = createFakeClient({
      member_profiles: [
        {
          email: "missing@novaforza.com",
          full_name: "Missing User",
          id: "member-1",
          status: "active",
          supabase_user_id: "gone-1",
        },
      ],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    serverMocks.getFirebaseAdminAuth.mockReturnValue({
      deleteUser: vi.fn(async () => undefined),
      getUser: vi.fn(async () => {
        throw { code: "auth/user-not-found" };
      }),
      getUserByEmail: vi.fn(async () => {
        throw { code: "auth/user-not-found" };
      }),
    });

    const { deleteMemberProfile } = await import("./gym-management");
    await deleteMemberProfile("member-1");

    expect(client.state.member_profiles).toHaveLength(0);
  });

  it("does not delete a different Firebase account discovered only by email fallback", async () => {
    const client = createFakeClient({
      member_profiles: [
        {
          email: "member@novaforza.com",
          full_name: "Member One",
          id: "member-1",
          status: "active",
          supabase_user_id: "gone-1",
        },
      ],
    });
    const deleteUser = vi.fn(async () => undefined);
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    serverMocks.getFirebaseAdminAuth.mockReturnValue({
      deleteUser,
      getUser: vi.fn(async () => {
        throw { code: "auth/user-not-found" };
      }),
      getUserByEmail: vi.fn(async () => ({
        uid: "other-user",
        email: "member@novaforza.com",
      })),
    });

    const { deleteMemberProfile } = await import("./gym-management");
    await deleteMemberProfile("member-1");

    expect(deleteUser).not.toHaveBeenCalled();
    expect(client.state.member_profiles).toHaveLength(0);
  });

  it("cleans up operational dependencies (plans, assignments, feedback) when deleting a member profile", async () => {
    const client = createFakeClient({
      member_profiles: [{ id: "member-1", email: "test@test.com" }],
      member_plan_snapshots: [{ id: "plan-1", member_id: "member-1" }],
      routine_assignments: [{ id: "assign-1", member_id: "member-1" }],
      member_routine_feedback: [{ id: "feed-1", member_id: "member-1" }],
    });
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    const { listPersistedUserRolesForUser } = await import("@/lib/user-roles");
    vi.mocked(listPersistedUserRolesForUser).mockResolvedValue([]);

    const { deleteMemberProfile } = await import("./gym-management");
    await deleteMemberProfile("member-1");

    expect(client.state.member_profiles).toHaveLength(0);
    expect(client.state.member_plan_snapshots).toHaveLength(0);
    expect(client.state.routine_assignments).toHaveLength(0);
    expect(client.state.member_routine_feedback).toHaveLength(0);
  });

  it("fails loudly when cleanup of auth references breaks", async () => {
    const client = createFakeClient(
      {
        member_profiles: [
          {
            email: "member@novaforza.com",
            full_name: "Member One",
            id: "member-1",
            status: "active",
            supabase_user_id: "user-1",
          },
        ],
        pickup_request: [
          {
            id: "pickup-1",
            supabase_user_id: "user-1",
          },
        ],
      },
      {
        pickup_request: {
          update: "pickup cleanup failed",
        },
      },
    );
    const deleteUser = vi.fn(async () => undefined);
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    serverMocks.getFirebaseAdminAuth.mockReturnValue({
      deleteUser,
      getUser: vi.fn(async () => ({
        uid: "user-1",
        email: "member@novaforza.com",
      })),
      getUserByEmail: vi.fn(async () => ({
        uid: "user-1",
        email: "member@novaforza.com",
      })),
    });

    const { listPersistedUserRolesForUser } = await import("@/lib/user-roles");
    vi.mocked(listPersistedUserRolesForUser).mockResolvedValue([]);

    const { deleteMemberProfile } = await import("./gym-management");

    await expect(deleteMemberProfile("member-1")).rejects.toThrow("pickup cleanup failed");
    expect(client.state.member_profiles).toHaveLength(1);
    expect(deleteUser).toHaveBeenCalledWith("user-1");
  });

  it("does not delete a protected staff auth account when removing a member profile", async () => {
    const client = createFakeClient({
      member_profiles: [
        {
          email: "coach@novaforza.com",
          full_name: "Coach Member",
          id: "member-1",
          status: "active",
          supabase_user_id: "staff-1",
        },
      ],
      user_roles: [
        {
          role: "trainer",
          user_id: "staff-1",
        },
      ],
    });
    const deleteUser = vi.fn(async () => undefined);
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);
    serverMocks.getFirebaseAdminAuth.mockReturnValue({
      deleteUser,
      getUser: vi.fn(async () => ({
        uid: "staff-1",
        email: "coach@novaforza.com",
      })),
      getUserByEmail: vi.fn(async () => ({
        uid: "staff-1",
        email: "coach@novaforza.com",
      })),
    });

    const { listPersistedUserRolesForUser } = await import("@/lib/user-roles");
    vi.mocked(listPersistedUserRolesForUser).mockResolvedValue([
      {
        assigned_at: "2026-04-01T10:00:00.000Z",
        is_irreversible: true,
        note: null,
        role: "trainer",
        user_id: "staff-1",
      },
    ]);

    const { deleteMemberProfile } = await import("./gym-management");
    await deleteMemberProfile("member-1");

    expect(deleteUser).not.toHaveBeenCalled();
    expect(client.state.member_profiles).toHaveLength(0);
  });

  it("returns enriched live routine template previews for staff surfaces", async () => {
    const client = createFakeClient({
      routine_template_blocks: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          description: "Trabajo base",
          id: "block-1",
          routine_template_id: "template-1",
          sort_order: 0,
          title: "Dia 1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_template_exercises: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          id: "exercise-1",
          name: "Back squat",
          notes: null,
          reps_label: "5",
          rest_seconds: 120,
          routine_block_id: "block-1",
          sets_label: "4",
          sort_order: 0,
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      routine_templates: [
        {
          created_at: "2026-04-01T10:00:00.000Z",
          created_by: null,
          difficulty_label: "Media",
          duration_label: "6 semanas",
          goal: "Fuerza general",
          id: "template-1",
          intensity_label: "Media",
          is_active: true,
          notes: "Usar como base de seguimiento.",
          slug: "fuerza-base",
          status_label: "Activa",
          summary: "Base operativa para asignacion recurrente.",
          title: "Fuerza base",
          trainer_user_id: "trainer-1",
          updated_at: "2026-04-01T10:00:00.000Z",
        },
      ],
      trainer_profiles: [
        {
          bio: null,
          branch_name: "Centro",
          created_at: "2026-04-01T10:00:00.000Z",
          display_name: "Coach Nova",
          is_active: true,
          updated_at: "2026-04-01T10:00:00.000Z",
          user_id: "trainer-1",
        },
      ],
    });
    serverMocks.listAllFirebaseUsers.mockResolvedValue([
      {
        uid: "trainer-1",
        email: "coach@novaforza.com",
        emailVerified: true,
        displayName: "Coach Nova",
        metadata: {
          creationTime: "2026-04-01T10:00:00.000Z",
          lastSignInTime: "2026-04-01T10:00:00.000Z",
        },
        providerData: [{ providerId: "password" }],
      },
    ]);
    serverMocks.createSupabaseAdminClient.mockReturnValue(client);

    const { listPersistedUserRoles } = await import("@/lib/user-roles");
    vi.mocked(listPersistedUserRoles).mockResolvedValue([
      {
        assigned_at: "2026-04-01T10:00:00.000Z",
        is_irreversible: false,
        note: null,
        role: "trainer",
        user_id: "trainer-1",
      },
    ]);

    const { listLiveRoutineTemplates } = await import("./gym-management");
    const templates = await listLiveRoutineTemplates();

    expect(templates).toEqual([
      expect.objectContaining({
        blockCount: 1,
        difficultyLabel: "Media",
        exerciseCount: 1,
        statusLabel: "Activa",
        summary: "Base operativa para asignacion recurrente.",
        trainerName: "Coach Nova",
      }),
    ]);
  });
});
