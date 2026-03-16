"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { updateLeadStatus } from "@/app/(admin)/dashboard/actions";
import type { LeadStatus } from "@/lib/supabase/database.types";

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(status: LeadStatus) {
    startTransition(async () => {
      try {
        setError(null);
        await updateLeadStatus(leadId, status);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "No se pudo actualizar el estado.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <label className="sr-only" htmlFor={`lead-status-${leadId}`}>
        Estado del lead
      </label>
      <div className="flex items-center gap-2">
        <select
          id={`lead-status-${leadId}`}
          defaultValue={currentStatus}
          onChange={(event) => handleChange(event.target.value as LeadStatus)}
          disabled={isPending || Boolean(disabledReason)}
          title={disabledReason ?? undefined}
          className="h-10 rounded-xl border border-white/10 bg-[#0a1219] px-3 text-sm text-white outline-none transition-colors focus:border-[#8da4b3]/50 disabled:opacity-60"
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : null}
      </div>
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
