"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/features/admin/components/shared/delete-confirm-dialog";

interface DeleteEntityButtonProps {
  entityId: string;
  onDelete: (id: string) => Promise<void>;
  title: string;
  description: string;
  redirectTo: string;
  successMessage: string;
  errorMessage?: string;
  label?: string;
  pendingLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

export default function DeleteEntityButton({
  entityId,
  onDelete,
  title,
  description,
  redirectTo,
  successMessage,
  errorMessage = "No se pudo eliminar el registro.",
  label = "Eliminar solicitud",
  pendingLabel = "Eliminando...",
  variant = "destructive",
  size = "default",
  className,
}: Readonly<DeleteEntityButtonProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? pendingLabel : label}
      </Button>

      <DeleteConfirmDialog
        isOpen={isOpen}
        onClose={() => {
          if (!isPending) {
            setIsOpen(false);
          }
        }}
        onConfirm={() => {
          startTransition(async () => {
            try {
              await onDelete(entityId);
              setIsOpen(false);
              toast.success(successMessage);
              router.push(redirectTo);
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : errorMessage);
            }
          });
        }}
        title={title}
        description={description}
        loading={isPending}
      />
    </>
  );
}
