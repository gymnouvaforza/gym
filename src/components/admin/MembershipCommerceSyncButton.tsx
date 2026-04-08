"use client";

import { AlertTriangle, Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { retryMembershipRequestCommerceSyncAction } from "@/app/(admin)/dashboard/membresias/actions";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";

interface MembershipCommerceSyncButtonProps {
  memberId?: string;
  membershipRequestId: string;
}

export default function MembershipCommerceSyncButton({
  memberId,
  membershipRequestId,
}: Readonly<MembershipCommerceSyncButtonProps>) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRetry() {
    setFeedback(null);

    startTransition(async () => {
      try {
        await retryMembershipRequestCommerceSyncAction(membershipRequestId, memberId);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo reintentar la sincronizacion con Medusa.",
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleRetry}
        disabled={isPending}
        className="h-11 w-full rounded-none border-black/10 text-[10px] font-black uppercase tracking-[0.18em]"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
        Reintentar mirror Medusa
      </Button>

      {feedback ? (
        <PublicInlineAlert
          compact
          message={feedback}
          title="No se pudo completar el reintento"
          tone="error"
        />
      ) : null}

      <p className="flex items-center gap-2 text-[11px] text-[#5f6368]">
        <AlertTriangle className="h-3.5 w-3.5 text-[#d71920]" />
        El reintento no altera el ciclo local ni los cobros manuales ya registrados.
      </p>
    </div>
  );
}
