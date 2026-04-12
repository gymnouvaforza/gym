import type { HTMLAttributes } from "react";

import type { PickupRequestDetail } from "@/lib/cart/types";
import { buildPickupRequestTimeline } from "@/lib/data/pickup-request-dashboard";
import { cn } from "@/lib/utils";

function formatDate(value: string | null) {
  if (!value) {
    return "Sin marca";
  }

  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const stateClasses = {
  completed: {
    dot: "bg-emerald-600",
    border: "border-emerald-200 bg-emerald-50/60",
    label: "text-emerald-800",
  },
  current: {
    dot: "bg-[#d71920]",
    border: "border-[#d71920]/15 bg-[#fff4f4]",
    label: "text-[#b91c1c]",
  },
  pending: {
    dot: "bg-[#c9ccd1]",
    border: "border-black/8 bg-white",
    label: "text-[#5f6368]",
  },
  warning: {
    dot: "bg-amber-600",
    border: "border-amber-200 bg-amber-50/70",
    label: "text-amber-800",
  },
} as const;

interface PickupRequestTimelineProps extends HTMLAttributes<HTMLDivElement> {
  pickupRequest: PickupRequestDetail;
  compact?: boolean;
}

export default function PickupRequestTimeline({
  pickupRequest,
  className,
  ...props
}: Readonly<PickupRequestTimelineProps>) {
  const steps = buildPickupRequestTimeline(pickupRequest);

  return (
    <div
      className={cn(
        "space-y-3",
        className,
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const styles = stateClasses[step.state];
        const isLast = index === steps.length - 1;

        return (
          <article
            key={step.key}
            className={cn(
              "relative overflow-hidden border p-4 transition-all duration-300",
              styles.border,
            )}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex w-4 shrink-0 flex-col items-center pt-1">
                <span className={cn("block h-2.5 w-2.5 rounded-full", styles.dot)} />
                {step.state === "current" && (
                  <span className="absolute left-[3px] top-1 h-2.5 w-2.5 animate-ping rounded-full bg-[#d71920]" />
                )}
                {!isLast ? <span className="mt-2 h-10 w-px bg-black/10" /> : null}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase leading-none tracking-[0.2em]",
                      styles.label,
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] font-medium text-[#7a7f87] tabular-nums">
                    {formatDate(step.date)}
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed text-[#111111]">
                  {step.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
