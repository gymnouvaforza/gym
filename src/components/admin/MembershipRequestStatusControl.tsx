"use client";

import { CheckCircle2, Loader2, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { updateMembershipRequestStatusAction } from "@/app/(admin)/dashboard/membresias/actions";
import { Button } from "@/components/ui/button";
import {
  membershipRequestStatusLabels,
  type MembershipRequestStatus,
} from "@/lib/memberships";

interface MembershipRequestStatusControlProps {
  memberId: string;
  membershipRequestId: string;
  status: MembershipRequestStatus;
}

const statusOptions: MembershipRequestStatus[] = [
  "requested",
  "confirmed",
  "active",
  "paused",
  "expired",
  "cancelled",
];

export default function MembershipRequestStatusControl({
  memberId,
  membershipRequestId,
  status,
}: Readonly<MembershipRequestStatusControlProps>) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<MembershipRequestStatus>(status);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const quickActions = useMemo(() => {
    switch (status) {
      case "requested":
        return [
          {
            icon: CheckCircle2,
            label: "Confirmar solicitud",
            nextStatus: "confirmed" as const,
          },
        ];
      case "confirmed":
        return [
          {
            icon: PlayCircle,
            label: "Activar membresia",
            nextStatus: "active" as const,
          },
        ];
      case "active":
        return [
          {
            icon: PauseCircle,
            label: "Pausar ciclo",
            nextStatus: "paused" as const,
          },
        ];
      case "paused":
        return [
          {
            icon: PlayCircle,
            label: "Reactivar ciclo",
            nextStatus: "active" as const,
          },
          {
            icon: XCircle,
            label: "Marcar vencida",
            nextStatus: "expired" as const,
          },
        ];
      default:
        return [];
    }
  }, [status]);

  function updateStatus(nextStatus: MembershipRequestStatus) {
    setFeedback(null);

    startTransition(async () => {
      try {
        await updateMembershipRequestStatusAction(
          membershipRequestId,
          nextStatus,
          memberId,
        );
        setSelectedStatus(nextStatus);
        setFeedback("Estado operativo actualizado.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el estado de la membresia.",
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      {quickActions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.nextStatus}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => updateStatus(action.nextStatus)}
                disabled={isPending}
                className="h-10 rounded-none text-[10px] font-black uppercase tracking-[0.12em]"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value as MembershipRequestStatus)}
          className="flex h-11 flex-1 rounded-none border border-black/10 bg-white px-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#111111] outline-none"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {membershipRequestStatusLabels[option]}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={() => updateStatus(selectedStatus)}
          disabled={isPending || selectedStatus === status}
          className="h-11 rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Aplicar cambio
        </Button>
      </div>

      <p className="text-sm text-[#5f6368]" aria-live="polite">
        {isPending ? "Actualizando estado..." : feedback ?? "El cambio de estado no borra el historial de pagos."}
      </p>
    </div>
  );
}
