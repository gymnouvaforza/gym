"use client";

import { useState, useTransition } from "react";

import { resendDashboardPickupRequestEmail } from "@/app/(admin)/dashboard/tienda/actions";
import FeedbackCallout, { type FeedbackTone } from "@/components/ui/feedback-callout";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { PickupRequestEmailStatus } from "@/lib/cart/types";

interface PickupRequestEmailButtonProps {
  pickupRequestId: string;
  emailStatus?: PickupRequestEmailStatus;
  label?: string;
  title?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function PickupRequestEmailButton({
  pickupRequestId,
  emailStatus = "sent",
  label,
  title,
  variant = "outline",
  size = "default",
  className,
}: Readonly<PickupRequestEmailButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);
  const resolvedLabel =
    label ??
    (emailStatus === "failed"
      ? "Reintentar email"
      : emailStatus === "pending"
        ? "Enviar email"
        : "Reenviar email");

  return (
    <div className="space-y-3">
      <Button
        type="button"
        disabled={isPending}
        variant={variant}
        size={size}
        title={title}
        className={className}
        onClick={() => {
          setFeedback(null);

          startTransition(async () => {
            try {
              await resendDashboardPickupRequestEmail(pickupRequestId);
              setFeedback({
                tone: "success",
                message: "Email reenviado correctamente.",
              });
            } catch (error) {
              setFeedback({
                tone: "error",
                message:
                  error instanceof Error ? error.message : "No se pudo reenviar el email.",
              });
            }
          });
        }}
      >
        {isPending ? "Enviando..." : resolvedLabel}
      </Button>

      {feedback ? (
        <FeedbackCallout chrome="admin" tone={feedback.tone} message={feedback.message} compact />
      ) : null}
    </div>
  );
}
