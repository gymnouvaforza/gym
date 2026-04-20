"use client";

import { useEffect, useState, useTransition } from "react";
import type { UseFormReturn, FieldValues } from "react-hook-form";
import { saveDraftAction, getDraftAction, deleteDraftAction } from "@/app/(admin)/dashboard/draft-actions";

interface UseFormDraftOptions<T extends FieldValues> {
  formKey: string;
  recordId: string;
  form: UseFormReturn<T>;
  onDraftLoaded?: (data: T) => void;
}

export function useFormDraft<T extends FieldValues>({
  formKey,
  recordId,
  form,
  onDraftLoaded,
}: UseFormDraftOptions<T>) {
  const [isSaving, startSaving] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState<T | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    async function checkDraft() {
      try {
        const draft = await getDraftAction(formKey, recordId);
        if (draft) {
          setHasDraft(true);
          setDraftData(draft.payload as T);
        }
      } catch (error) {
        console.error("Failed to check for draft:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkDraft();
  }, [formKey, recordId]);

  /**
   * Saves the current form state as a draft.
   * Bypasses validation.
   */
  async function saveDraft() {
    const values = form.getValues();
    startSaving(async () => {
      try {
        await saveDraftAction(formKey, recordId, values);
        setHasDraft(true);
        setDraftData(values as T);
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    });
  }

  /**
   * Clears the draft from the database.
   */
  async function clearDraft() {
    try {
      await deleteDraftAction(formKey, recordId);
      setHasDraft(false);
      setDraftData(null);
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }

  /**
   * Applies draft data to the form.
   */
  function applyDraft() {
    if (draftData) {
      form.reset({
        ...form.getValues(),
        ...draftData,
      });
      if (onDraftLoaded) onDraftLoaded(draftData);
    }
  }

  return {
    isSaving,
    isLoading,
    hasDraft,
    draftData,
    saveDraft,
    clearDraft,
    applyDraft,
  };
}
