// Data helpers for private member and membership-request notes in the admin backoffice.
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { DBMemberNote, DBMembershipRequestNote } from "@/lib/supabase/database.types";

export type MemberNote = {
  content: string;
  createdAt: string;
  createdByEmail: string | null;
  createdByUserId: string | null;
  id: string;
  memberId: string;
};

export type MembershipRequestNote = {
  content: string;
  createdAt: string;
  createdByEmail: string | null;
  createdByUserId: string | null;
  id: string;
  membershipRequestId: string;
};

type QueryResult<Row> = {
  data: Row | Row[] | null;
  error: { message: string } | null;
};

type SupabaseNotesQuery<Row> = PromiseLike<QueryResult<Row>> & {
  eq(field: string, value: unknown): SupabaseNotesQuery<Row>;
  insert(payload: Record<string, unknown>): SupabaseNotesQuery<Row>;
  order(field: string, options?: { ascending?: boolean }): SupabaseNotesQuery<Row>;
  select(columns?: string): SupabaseNotesQuery<Row>;
  single(): Promise<QueryResult<Row>>;
};

export type MemberNotesClient = {
  from(table: "member_notes"): SupabaseNotesQuery<DBMemberNote>;
  from(table: "membership_request_notes"): SupabaseNotesQuery<DBMembershipRequestNote>;
};

function getClient(client?: MemberNotesClient) {
  return client ?? (createSupabaseAdminClient() as unknown as MemberNotesClient);
}

function normalizeNoteContent(content: string) {
  const normalized = content.trim();

  if (!normalized) {
    throw new Error("El contenido de la nota no puede estar vacio.");
  }

  return normalized;
}

function mapMemberNote(row: DBMemberNote): MemberNote {
  return {
    content: row.content,
    createdAt: row.created_at,
    createdByEmail: row.created_by_email ?? null,
    createdByUserId: row.created_by_user_id ?? null,
    id: row.id,
    memberId: row.member_id,
  };
}

function mapMembershipRequestNote(row: DBMembershipRequestNote): MembershipRequestNote {
  return {
    content: row.content,
    createdAt: row.created_at,
    createdByEmail: row.created_by_email ?? null,
    createdByUserId: row.created_by_user_id ?? null,
    id: row.id,
    membershipRequestId: row.membership_request_id,
  };
}

export async function addMemberNote(
  memberId: string,
  content: string,
  userId?: string | null,
  email?: string | null,
  client?: MemberNotesClient,
) {
  const { data, error } = await getClient(client)
    .from("member_notes")
    .insert({
      content: normalizeNoteContent(content),
      created_by_email: email ?? null,
      created_by_user_id: userId ?? null,
      member_id: memberId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapMemberNote(data as DBMemberNote);
}

export async function listMemberNotes(memberId: string, client?: MemberNotesClient) {
  const { data, error } = await getClient(client)
    .from("member_notes")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DBMemberNote[]).map(mapMemberNote);
}

export async function addMembershipRequestNote(
  requestId: string,
  content: string,
  userId?: string | null,
  email?: string | null,
  client?: MemberNotesClient,
) {
  const { data, error } = await getClient(client)
    .from("membership_request_notes")
    .insert({
      content: normalizeNoteContent(content),
      created_by_email: email ?? null,
      created_by_user_id: userId ?? null,
      membership_request_id: requestId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapMembershipRequestNote(data as DBMembershipRequestNote);
}

export async function listMembershipRequestNotes(
  requestId: string,
  client?: MemberNotesClient,
) {
  const { data, error } = await getClient(client)
    .from("membership_request_notes")
    .select("*")
    .eq("membership_request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DBMembershipRequestNote[]).map(mapMembershipRequestNote);
}
