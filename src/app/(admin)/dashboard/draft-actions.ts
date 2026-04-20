"use server";

import { requireAdminUser } from "@/lib/auth";
import {
  upsertFormDraft,
  getFormDraft,
  deleteFormDraft,
} from "@/lib/supabase/draft-queries";
import { Json } from "@/lib/supabase/database.types";

/**
 * Saves a form draft for the current admin user.
 */
export async function saveDraftAction(formKey: string, recordId: string, payload: unknown) {
  const user = await requireAdminUser();
  
  // Resolve user ID (handle local admin case if needed, though they usually don't have drafts)
  const userId = "id" in user ? user.id : null;
  if (!userId) {
    throw new Error("No se pudo identificar el usuario para guardar el borrador.");
  }

  return await upsertFormDraft({
    user_id: userId,
    form_key: formKey,
    record_id: recordId,
    payload: payload as Json,
  });
}

/**
 * Retrieves a draft for the current admin user and context.
 */
export async function getDraftAction(formKey: string, recordId: string) {
  const user = await requireAdminUser();
  const userId = "id" in user ? user.id : null;
  
  if (!userId) return null;

  return await getFormDraft(userId, formKey, recordId);
}

/**
 * Deletes a draft.
 */
export async function deleteDraftAction(formKey: string, recordId: string) {
  const user = await requireAdminUser();
  const userId = "id" in user ? user.id : null;
  
  if (!userId) return;

  await deleteFormDraft(userId, formKey, recordId);
}
