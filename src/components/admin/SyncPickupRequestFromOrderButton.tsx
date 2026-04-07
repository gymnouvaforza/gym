"use client";

import { useState, useTransition } from "react";

import { syncPickupRequestFromMedusaOrderAction } from "@/app/(admin)/dashboard/tienda/actions";
import FeedbackCallout, { type FeedbackTone } from "@/components/ui/feedback-callout";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SyncPickupRequestFromOrderButtonProps {
  pickupRequestId: string;
  cartId: string;
  orderId: string | null;
  label?: string;
  title?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function SyncPickupRequestFromOrderButton({
  pickupRequestId,
  cartId,
  orderId,
  label,
  title,
  variant = "outline",
  size = "default",
  className,
}: Readonly<SyncPickupRequestFromOrderButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);

  if (!orderId) {
    return null;
  }

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

          if (
            !confirm(
              "Deseas sincronizar este pedido de Medusa con la solicitud pickup local? Esto sobrescribira el snapshot actual si ya existe.",
            )
          ) {
            return;
          }

          startTransition(async () => {
            try {
              await syncPickupRequestFromMedusaOrderAction(pickupRequestId, cartId, orderId);
              setFeedback({
                tone: "success",
                message:
                  "Sincronizacion completada correctamente. El snapshot local ya refleja el pedido de Medusa.",
              });
            } catch (error) {
              setFeedback({
                tone: "error",
                message:
                  error instanceof Error ? error.message : "No se pudo sincronizar el pedido.",
              });
            }
          });
        }}
      >
        {isPending ? "Sincronizando..." : (label ?? "Actualizar snapshot")}
      </Button>

      {feedback ? (
        <FeedbackCallout chrome="admin" tone={feedback.tone} message={feedback.message} compact />
      ) : null}
    </div>
  );
}
