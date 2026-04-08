"use client";

import { Loader2, NotebookPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addMembershipRequestAnnotationAction } from "@/app/(admin)/dashboard/membresias/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MembershipRequestAnnotationsFormProps {
  memberId: string;
  membershipRequestId: string;
}

export default function MembershipRequestAnnotationsForm({
  memberId,
  membershipRequestId,
}: Readonly<MembershipRequestAnnotationsFormProps>) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!content.trim()) {
      setFeedback("Escribe una anotacion antes de guardar.");
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        await addMembershipRequestAnnotationAction(
          membershipRequestId,
          { content },
          memberId,
        );
        setContent("");
        setFeedback("Anotacion guardada en la bitacora interna.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo guardar la anotacion de membresia.",
        );
      }
    });
  }

  return (
    <div className="space-y-4 border border-black/10 bg-black/[0.02] p-5">
      <Textarea
        rows={4}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Registra acuerdos de pago, contexto manual o cualquier seguimiento interno relevante."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#5f6368]" aria-live="polite">
          {isPending ? "Guardando anotacion..." : feedback ?? "Las anotaciones son privadas del equipo."}
        </p>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="h-11 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <NotebookPen className="h-4 w-4" />
          )}
          Guardar anotacion
        </Button>
      </div>
    </div>
  );
}
