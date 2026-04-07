"use client";

import { Loader2, NotebookPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addPickupRequestAnnotationAction } from "@/app/(admin)/dashboard/tienda/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PickupRequestAnnotationsFormProps {
  pickupRequestId: string;
}

export default function PickupRequestAnnotationsForm({
  pickupRequestId,
}: PickupRequestAnnotationsFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitAnnotation() {
    setFeedback(null);

    startTransition(async () => {
      try {
        await addPickupRequestAnnotationAction(pickupRequestId, { content });
        setContent("");
        setFeedback("Anotacion guardada en la bitacora interna.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "No se pudo guardar la anotacion interna.",
        );
      }
    });
  }

  return (
    <div className="space-y-4 border border-black/10 bg-black/[0.02] p-5">
      <div className="space-y-2">
        <Label
          htmlFor={`pickup-request-annotation-${pickupRequestId}`}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]"
        >
          Nueva anotacion
        </Label>
        <Textarea
          id={`pickup-request-annotation-${pickupRequestId}`}
          rows={5}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Ejemplo: cliente responde por WhatsApp y confirma recogida para manana por la tarde."
        />
        <p className="text-xs leading-relaxed text-[#5f6368]">
          Bitacora solo admin. Cada entrada se guarda como registro nuevo para no perder contexto.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-black/8 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#5f6368]" aria-live="polite">
          {isPending
            ? "Guardando anotacion..."
            : feedback ?? "Usa este bloque para seguimiento interno, acuerdos y cobros manuales."}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={submitAnnotation}
          disabled={isPending || content.trim().length < 2}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <NotebookPen className="h-4 w-4" />
          )}
          Anadir anotacion
        </Button>
      </div>
    </div>
  );
}
