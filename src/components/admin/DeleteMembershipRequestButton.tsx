"use client";

import { deleteMembershipRequestAction } from "@/app/(admin)/dashboard/membresias/actions";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import type { ButtonProps } from "@/components/ui/button";

interface DeleteMembershipRequestButtonProps {
  membershipRequestId: string;
  memberId?: string;
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

export default function DeleteMembershipRequestButton({
  membershipRequestId,
  memberId,
  title = "Eliminar solicitud de membresia",
  description = "Esta accion no se puede deshacer. Se eliminara la solicitud y su historial operativo asociado.",
  redirectTo = "/dashboard/membresias/pedidos",
  successMessage = "Solicitud de membresia eliminada correctamente.",
  label = "Eliminar solicitud",
  pendingLabel = "Eliminando...",
  variant = "destructive",
  size = "default",
  className,
}: Readonly<DeleteMembershipRequestButtonProps>) {
  return (
    <DeleteEntityButton
      entityId={membershipRequestId}
      onDelete={(requestId) => deleteMembershipRequestAction(requestId, memberId)}
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
