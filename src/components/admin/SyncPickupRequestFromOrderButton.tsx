"use client";

import { useTransition } from "react";

import { syncPickupRequestFromMedusaOrderAction } from "@/app/(admin)/dashboard/tienda/actions";
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

  if (!orderId) {
    return null;
  }

  return (
    <Button
      type="button"
      disabled={isPending}
      variant={variant}
      size={size}
      title={title}
      className={className}
      onClick={() => {
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
            alert(
              "Sincronizacion completada correctamente. El snapshot local ya refleja el pedido de Medusa.",
            );
          } catch (error) {
            alert(error instanceof Error ? error.message : "No se pudo sincronizar el pedido.");
          }
        });
      }}
    >
      {isPending ? "Sincronizando..." : (label ?? "Actualizar snapshot")}
    </Button>
  );
}
