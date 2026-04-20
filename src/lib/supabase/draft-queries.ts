import { createSupabaseAdminClient } from "./server";
import type { Database } from "./database.types";

export type DBFormDraft = Database["public"]["Tables"]["form_drafts"]["Row"];
export type InsertFormDraft = Database["public"]["Tables"]["form_drafts"]["Insert"];

/**
 * Upserts a form draft for a specific user, form, and record.
 */
export async function upsertFormDraft(payload: InsertFormDraft) {
  const supabase = createSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from("form_drafts")
    .upsert(payload, {
      onConflict: "user_id, form_key, record_id",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error saving draft: ${error.message}`);
  }

  return data as DBFormDraft;
}

/**
 * Retrieves a specific form draft.
 */
export async function getFormDraft(userId: string, formKey: string, recordId: string) {
  const supabase = createSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from("form_drafts")
    .select("*")
    .eq("user_id", userId)
    .eq("form_key", formKey)
    .eq("record_id", recordId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching draft: ${error.message}`);
  }

  return data as DBFormDraft | null;
}

/**
 * Deletes a form draft.
 */
export async function deleteFormDraft(userId: string, formKey: string, recordId: string) {
  const supabase = createSupabaseAdminClient();
  
  const { error } = await supabase
    .from("form_drafts")
    .delete()
    .eq("user_id", userId)
    .eq("form_key", formKey)
    .eq("record_id", recordId);

  if (error) {
    throw new Error(`Error deleting draft: ${error.message}`);
  }
}
