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
        "grid gap-3",
        compact ? "lg:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4",
        className,
      )}
      {...props}
    >
      {steps.map((step) => {
        const styles = stateClasses[step.state];

        return (
          <article
            key={step.key}
            className={cn("rounded-none border p-4", styles.border)}
          >
            <div className="flex items-start gap-3">
              <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", styles.dot)} />
              <div className="min-w-0 space-y-1.5">
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", styles.label)}>
                  {step.title}
                </p>
                <p className="text-sm font-semibold text-[#111111]">{step.description}</p>
                <p className="text-xs leading-5 text-[#6b7280]">{formatDate(step.date)}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
