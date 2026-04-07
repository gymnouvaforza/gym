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
  compact = false,
  className,
  ...props
}: Readonly<PickupRequestTimelineProps>) {
  const steps = buildPickupRequestTimeline(pickupRequest);

  return (
    <div
      className={cn(
        "grid gap-1.5",
        compact ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4" : "grid-cols-2 md:grid-cols-4",
        className,
      )}
      {...props}
    >
      {steps.map((step) => {
        const styles = stateClasses[step.state];

        return (
          <article
            key={step.key}
            className={cn(
              "relative flex flex-col justify-between border p-5 transition-all duration-300",
              styles.border,
            )}
          >
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0 pt-1">
                <span className={cn("block h-2.5 w-2.5 rounded-full ring-2 ring-offset-2 ring-white/10", styles.dot)} />
                {step.state === "current" && (
                   <span className="absolute left-0 top-1 h-2.5 w-2.5 animate-ping rounded-full bg-[#d71920]" />
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none", styles.label)}>
                  {step.title}
                </p>
                <p className="line-clamp-2 text-[14px] font-bold leading-tight text-[#111111]">
                  {step.description}
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-3">
               <p className="text-[11px] font-medium text-[#7a7f87] tabular-nums">
                 {formatDate(step.date)}
               </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
