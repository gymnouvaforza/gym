"use client";

import { deleteDashboardPickupRequestAction } from "@/app/(admin)/dashboard/tienda/actions";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import type { ButtonProps } from "@/components/ui/button";

interface DeletePickupRequestButtonProps {
  pickupRequestId: string;
  title?: string;
  description?: string;
  redirectTo?: string;
  successMessage?: string;
  label?: string;
  pendingLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function DeletePickupRequestButton({
  pickupRequestId,
  title = "Eliminar solicitud pickup",
  description = "Esta accion no se puede deshacer. Se eliminara el pedido y su historial operativo asociado.",
  redirectTo = "/dashboard/tienda/pedidos",
  successMessage = "Solicitud pickup eliminada correctamente.",
  label = "Eliminar solicitud",
  pendingLabel = "Eliminando...",
  variant = "destructive",
  size = "default",
  className,
}: Readonly<DeletePickupRequestButtonProps>) {
  return (
    <DeleteEntityButton
      entityId={pickupRequestId}
      onDelete={deleteDashboardPickupRequestAction}
      title={title}
      description={description}
      redirectTo={redirectTo}
      successMessage={successMessage}
      label={label}
      pendingLabel={pendingLabel}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
