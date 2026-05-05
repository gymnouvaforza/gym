// Tests for the member notes data helpers using an in-memory Supabase client fake.
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addMemberNote,
  addMembershipRequestNote,
  listMemberNotes,
  listMembershipRequestNotes,
  type MemberNotesClient,
} from "@/lib/data/member-notes";

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
    member_notes: [],
    member_profiles: [],
    membership_request_notes: [],
    membership_requests: [],
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

    constructor(private readonly table: keyof TableState) {}

    delete() {
      this.operation = "delete";
      return this;
    }

    eq(field: string, value: unknown) {
      this.filters.push((row) => row[field] === value);
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

    select() {
      return this;
    }

    single() {
      this.shouldReturnSingle = true;
      return Promise.resolve(this.execute());
    }

    then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(this.execute()).then(resolve, reject);
    }

    update(payload: TableRow) {
      this.operation = "update";
      this.payload = payload;
      return this;
    }

    private execute() {
      const configuredFailure = failures[String(this.table)]?.[this.operation];
      if (configuredFailure) {
        return {
          data: null,
          error: { message: configuredFailure },
        };
      }

      if (this.operation === "insert") {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const insertedRows = rows.map((row) => {
          insertCount += 1;

          return {
            created_at: `2026-05-04T10:00:0${insertCount}.000Z`,
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

      if (this.operation === "delete") {
        const rowsToDelete = this.runSelect();
        state[this.table] = state[this.table].filter((row) => !rowsToDelete.includes(row));

        if (this.table === "member_profiles") {
          const deletedMemberIds = rowsToDelete.map((row) => row.id);
          state.member_notes = state.member_notes.filter(
            (note) => !deletedMemberIds.includes(note.member_id),
          );
        }

        return {
          data: this.shouldReturnSingle ? rowsToDelete[0] ?? null : rowsToDelete,
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
    from(table: keyof TableState) {
      return new QueryBuilder(table);
    },
    state,
  };
}

describe("member notes data helpers", () => {
  beforeEach(() => {
    serverMocks.createSupabaseAdminClient.mockReset();
  });

  it("adds and retrieves member notes with nullable authors", async () => {
    const client = createFakeClient({}) as unknown as MemberNotesClient;

    const note = await addMemberNote("member-1", "  Llamar por renovacion  ", undefined, undefined, client);
    const notes = await listMemberNotes("member-1", client);

    expect(note).toMatchObject({
      content: "Llamar por renovacion",
      createdByEmail: null,
      createdByUserId: null,
      memberId: "member-1",
    });
    expect(notes).toEqual([note]);
  });

  it("lists member notes in descending creation order", async () => {
    const client = createFakeClient({
      member_notes: [
        {
          content: "Nota antigua",
          created_at: "2026-05-04T08:00:00.000Z",
          created_by_email: "coach@novaforza.com",
          created_by_user_id: "coach-1",
          id: "note-old",
          member_id: "member-1",
        },
        {
          content: "Nota reciente",
          created_at: "2026-05-04T12:00:00.000Z",
          created_by_email: null,
          created_by_user_id: null,
          id: "note-new",
          member_id: "member-1",
        },
      ],
    }) as unknown as MemberNotesClient;

    const notes = await listMemberNotes("member-1", client);

    expect(notes.map((note) => note.id)).toEqual(["note-new", "note-old"]);
  });

  it("rejects empty member note content before inserting", async () => {
    const fakeClient = createFakeClient({});
    const client = fakeClient as unknown as MemberNotesClient;

    await expect(addMemberNote("member-1", "   ", "admin-1", "admin@novaforza.com", client))
      .rejects.toThrow("El contenido de la nota no puede estar vacio.");
    expect(fakeClient.state.member_notes).toEqual([]);
  });

  it("adds and retrieves membership request notes without an author", async () => {
    const client = createFakeClient({}) as unknown as MemberNotesClient;

    const note = await addMembershipRequestNote("request-1", "Pendiente de pago", null, null, client);
    const notes = await listMembershipRequestNotes("request-1", client);

    expect(note).toMatchObject({
      content: "Pendiente de pago",
      createdByEmail: null,
      createdByUserId: null,
      membershipRequestId: "request-1",
    });
    expect(notes).toEqual([note]);
  });

  it("lists membership request notes in descending creation order", async () => {
    const client = createFakeClient({
      membership_request_notes: [
        {
          content: "Primera revision",
          created_at: "2026-05-04T09:00:00.000Z",
          created_by_email: null,
          created_by_user_id: null,
          id: "request-note-old",
          membership_request_id: "request-1",
        },
        {
          content: "Revision final",
          created_at: "2026-05-04T13:00:00.000Z",
          created_by_email: "admin@novaforza.com",
          created_by_user_id: "admin-1",
          id: "request-note-new",
          membership_request_id: "request-1",
        },
      ],
    }) as unknown as MemberNotesClient;

    const notes = await listMembershipRequestNotes("request-1", client);

    expect(notes.map((note) => note.id)).toEqual(["request-note-new", "request-note-old"]);
  });

  it("rejects empty membership request note content before inserting", async () => {
    const fakeClient = createFakeClient({});
    const client = fakeClient as unknown as MemberNotesClient;

    await expect(addMembershipRequestNote("request-1", "\n\t", null, null, client)).rejects.toThrow(
      "El contenido de la nota no puede estar vacio.",
    );
    expect(fakeClient.state.membership_request_notes).toEqual([]);
  });

  it("reflects member note cascade when a member profile is deleted", async () => {
    const fakeClient = createFakeClient({
      member_notes: [
        {
          content: "Debe desaparecer",
          created_at: "2026-05-04T09:00:00.000Z",
          created_by_email: null,
          created_by_user_id: null,
          id: "note-1",
          member_id: "member-1",
        },
      ],
      member_profiles: [{ id: "member-1" }],
    });
    const client = fakeClient as unknown as MemberNotesClient;

    await fakeClient.from("member_profiles").delete().eq("id", "member-1");

    await expect(listMemberNotes("member-1", client)).resolves.toEqual([]);
  });
});
