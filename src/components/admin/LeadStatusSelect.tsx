"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { updateLeadStatus } from "@/app/(admin)/dashboard/actions";
import FeedbackCallout from "@/components/ui/feedback-callout";
import type { LeadStatus } from "@/lib/supabase/database.types";

import LeadStatusBadge from "./LeadStatusBadge";

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
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  function handleChange(status: LeadStatus) {
    const previousStatus = selectedStatus;
    setSelectedStatus(status);
    setFeedback("Guardando estado...");

    startTransition(async () => {
      try {
        setError(null);
        await updateLeadStatus(leadId, status);
        setFeedback("Estado actualizado.");
      } catch (nextError) {
        setSelectedStatus(previousStatus);
        setFeedback(null);
        setError(nextError instanceof Error ? nextError.message : "No se pudo actualizar el estado.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <label className="sr-only" htmlFor={`lead-status-${leadId}`}>
        Estado del lead
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          id={`lead-status-${leadId}`}
          value={selectedStatus}
          onChange={(event) => handleChange(event.target.value as LeadStatus)}
          disabled={isPending || Boolean(disabledReason)}
          title={disabledReason ?? undefined}
          className="h-11 rounded-none border border-black/10 bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#d71920]/30 focus-visible:ring-2 focus-visible:ring-[#d71920]/20 disabled:opacity-60"
        >
          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-[#7a7f87]" /> : null}
        {!isPending ? <LeadStatusBadge status={selectedStatus} /> : null}
      </div>
      <p className="text-xs text-[#5f6368]" aria-live="polite">
        {feedback ?? (disabledReason ? "Solo lectura." : "")}
      </p>
      {error ? <FeedbackCallout chrome="admin" tone="error" message={error} compact /> : null}
    </div>
  );
}
