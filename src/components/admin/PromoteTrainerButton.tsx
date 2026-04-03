"use client";

import { useState, useTransition } from "react";

import { promoteDashboardUserToTrainer } from "@/app/(admin)/dashboard/mobile/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PromoteTrainerButtonProps {
  disabled?: boolean;
  disabledReason?: string;
  userEmail: string;
  userId: string;
}

export default function PromoteTrainerButton({
  disabled = false,
  disabledReason,
  userEmail,
  userId,
}: Readonly<PromoteTrainerButtonProps>) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setFeedback(null);
    startTransition(async () => {
      try {
        await promoteDashboardUserToTrainer(userId);
        setFeedback("Usuario promocionado a trainer.");
        setOpen(false);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "No se pudo promocionar el usuario.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isPending}
            title={disabledReason}
          >
            Hacer trainer
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promocion irreversible a trainer</DialogTitle>
            <DialogDescription>
              {userEmail} ganara acceso staff persistente para la app mobile. Esta accion se
              considera irreversible desde la UI del dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={isPending}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {feedback ? <p className="text-xs text-[#5f6368]">{feedback}</p> : null}
      {disabledReason && disabled ? <p className="text-xs text-[#5f6368]">{disabledReason}</p> : null}
    </div>
  );
}
