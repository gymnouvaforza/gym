"use client";

import { RotateCcw } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { updateLeadStatus } from "@/app/(admin)/dashboard/actions";
import type { LeadStatus } from "@/lib/supabase/database.types";
import { getLeadStatusMeta } from "@/lib/admin-dashboard";
import { cn } from "@/lib/utils";

interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: LeadStatus;
  disabledReason?: string;
}

const items: Array<{ label: string; value: LeadStatus }> = [
  { label: "Nuevo", value: "new" },
  { label: "Contactado", value: "contacted" },
  { label: "Cerrado", value: "closed" },
];

export default function LeadStatusSelect({
  leadId,
  currentStatus,
  disabledReason,
}: LeadStatusSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    currentStatus,
    (_, newStatus: LeadStatus) => newStatus
  );

  function handleChange(status: LeadStatus) {
    startTransition(async () => {
      setOptimisticStatus(status);
      try {
        await updateLeadStatus(leadId, status);
        toast.success(`Estado actualizado a ${status.toUpperCase()}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo actualizar el estado.");
      }
    });
  }

  const meta = getLeadStatusMeta(optimisticStatus);

  const getSelectStyle = () => {
    switch (meta.tone) {
      case "success":
        return "border-emerald-500/20 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
      case "warning":
        return "border-amber-500/20 bg-amber-50 text-amber-700 hover:bg-amber-100";
      case "muted":
        return "border-black/5 bg-black/[0.03] text-[#7a7f87] hover:bg-black/[0.06]";
      default:
        return "border-transparent bg-black text-white hover:bg-black/90";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group/select">
        <label className="sr-only" htmlFor={`lead-status-${leadId}`}>
          Estado del lead
        </label>
        <div 
          className={cn(
            "relative inline-flex items-center justify-between h-8 rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer group shadow-sm",
            getSelectStyle(),
            isPending && "opacity-50 grayscale"
          )}
        >
          <span className="mr-3">{meta.label}</span>
          <div className="flex items-center opacity-40 group-hover/select:opacity-100 transition-opacity">
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <select
            id={`lead-status-${leadId}`}
            value={optimisticStatus}
            onChange={(event) => handleChange(event.target.value as LeadStatus)}
            disabled={isPending || Boolean(disabledReason)}
            title={disabledReason ?? undefined}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {items.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isPending && <RotateCcw className="size-3.5 animate-spin text-[#d71920]" />}
    </div>
  );
}
