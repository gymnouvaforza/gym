"use client";

import { useTransition } from "react";

import { resendDashboardPickupRequestEmail } from "@/app/(admin)/dashboard/tienda/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { PickupRequestEmailStatus } from "@/lib/cart/types";

interface ResendPickupRequestEmailButtonProps {
  pickupRequestId: string;
  emailStatus?: PickupRequestEmailStatus;
  label?: string;
  title?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function ResendPickupRequestEmailButton({
  pickupRequestId,
  emailStatus = "sent",
  label,
  title,
  variant = "outline",
  size = "default",
  className,
}: Readonly<ResendPickupRequestEmailButtonProps>) {
  const [isPending, startTransition] = useTransition();
  const resolvedLabel =
    label ??
    (emailStatus === "failed"
      ? "Reintentar email"
      : emailStatus === "pending"
        ? "Enviar email"
        : "Reenviar email");

  return (
    <Button
      type="button"
      disabled={isPending}
      variant={variant}
      size={size}
      title={title}
      className={className}
      onClick={() => {
        startTransition(async () => {
          try {
            await resendDashboardPickupRequestEmail(pickupRequestId);
            alert("Email reenviado correctamente.");
          } catch (error) {
            alert(error instanceof Error ? error.message : "No se pudo reenviar el email.");
          }
        });
      }}
    >
      {isPending ? "Enviando..." : resolvedLabel}
    </Button>
  );
}
