"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { updateLeadStatus } from "@/app/(admin)/dashboard/actions";
import FeedbackCallout from "@/components/ui/feedback-callout";
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

  const meta = getLeadStatusMeta(selectedStatus);

  const getSelectStyle = () => {
    switch (meta.tone) {
      case "success":
        return "border-green-800 bg-green-700/10 text-green-800 hover:bg-green-700/20";
      case "warning":
        return "border-amber-700 bg-amber-600/10 text-amber-900 hover:bg-amber-600/20";
      case "muted":
        return "border-black/5 bg-[#f3f4f6] text-[#7a7f87] hover:bg-black/5";
      default:
        return "border-transparent bg-black text-white hover:bg-black/90";
    }
  };

  return (
    <div className="space-y-2">
      <label className="sr-only" htmlFor={`lead-status-${leadId}`}>
        Estado del lead
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <div 
          className={cn(
            "relative inline-flex items-center justify-between h-7 rounded-none border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer group shadow-[2px_2px_0px_rgba(0,0,0,0.05)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
            getSelectStyle()
          )}
        >
          <span className="mr-2">{meta.label}</span>
          <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity">
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <select
            id={`lead-status-${leadId}`}
            value={selectedStatus}
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
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d71920]" /> : null}
      </div>
      {feedback && feedback !== "Estado actualizado." ? (
        <p className="text-[10px] text-[#5f6368] font-bold italic" aria-live="polite">
          {feedback}
        </p>
      ) : feedback === "Estado actualizado." ? (
        <p className="text-[10px] text-green-700 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-1" aria-live="polite">
          <span className="h-1 w-1 rounded-full bg-green-600" />
          {feedback}
        </p>
      ) : null}
      {error ? <FeedbackCallout chrome="admin" tone="error" message={error} compact /> : null}
    </div>
  );
}
