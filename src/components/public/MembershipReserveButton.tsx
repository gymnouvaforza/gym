"use client";

import { Loader2, QrCode, Repeat, ShieldPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { reserveMembershipPlanAction } from "@/app/(public)/membership-actions";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MembershipReserveButtonProps {
  className?: string;
  label: string;
  membershipPlanId: string;
  renewsFromRequestId?: string | null;
  variant?: "default" | "outline";
}

export default function MembershipReserveButton({
  className,
  label,
  membershipPlanId,
  renewsFromRequestId = null,
  variant = "default",
}: Readonly<MembershipReserveButtonProps>) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleReserve() {
    setFeedback(null);

    startTransition(async () => {
      try {
        const result = await reserveMembershipPlanAction({
          membershipPlanId,
          renewsFromRequestId,
        });
        router.push(`/mi-cuenta/membresias/${result.id}?created=1`);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo registrar la solicitud de membresia.",
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant={variant}
        onClick={handleReserve}
        disabled={isPending}
        className={cn(
          "h-12 rounded-none text-[10px] font-black uppercase tracking-[0.22em]",
          className,
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : renewsFromRequestId ? (
          <Repeat className="h-4 w-4" />
        ) : (
          <ShieldPlus className="h-4 w-4" />
        )}
        {label}
      </Button>

      <p className="flex items-center gap-2 text-[11px] text-[#5f6368]">
        <QrCode className="h-3.5 w-3.5 text-[#d71920]" />
        La solicitud queda vinculada a tu cuenta y te enviaremos acceso al QR por correo.
      </p>

      {feedback ? (
        <PublicInlineAlert
          tone="error"
          title="No se pudo registrar la membresia"
          message={feedback}
          compact
        />
      ) : null}
    </div>
  );
}
