"use client";

// Client form for adding append-only private notes to a member profile.
import { Loader2, NotebookPen } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

import { addMemberNoteAction } from "@/app/(admin)/dashboard/miembros/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MemberNotesFormProps {
  memberId: string;
  onNoteAdded?: () => void;
}

export function MemberNotesForm({ memberId, onNoteAdded }: Readonly<MemberNotesFormProps>) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
      toast.error("Escribe una observación antes de guardar.");
      return;
    }

    startTransition(async () => {
      try {
        await addMemberNoteAction(memberId, content);
        setContent("");
        toast.success("Observación guardada correctamente.");
        onNoteAdded?.();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo guardar la observación.",
        );
      }
    });
  }

  return (
    <form
      className="space-y-4 border border-black/10 bg-black/[0.02] p-5"
      onSubmit={handleSubmit}
    >
      <Textarea
        aria-label="Nueva observación"
        name="member-note"
        rows={3}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Añade una observación interna sobre este miembro..."
        disabled={isPending}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#5f6368]" aria-live="polite">
          Las observaciones son privadas del equipo.
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <NotebookPen className="h-4 w-4" />
          )}
          Guardar observación
        </Button>
      </div>
    </form>
  );
}
