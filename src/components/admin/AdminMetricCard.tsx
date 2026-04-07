import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import AdminSurface from "./AdminSurface";

const toneClasses = {
  default: "bg-[#fff5f5] text-[#d71920]",
  muted: "bg-[#f2efe8] text-[#5f6368]",
  success: "bg-[#eef9f1] text-[#237447]",
  warning: "bg-[#fff4e8] text-[#b86918]",
} as const;

interface AdminMetricCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: keyof typeof toneClasses;
  className?: string;
}

export default function AdminMetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: Readonly<AdminMetricCardProps>) {
  return (
    <AdminSurface className={cn("group overflow-hidden p-0", className)}>
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a7f87]">
            <span className={cn("h-1 w-1 rounded-full", toneClasses[tone].split(" ")[1].replace("text-", "bg-"))} />
            {label}
          </p>
          <p className="font-display text-4xl font-black italic tracking-tighter text-[#111111] sm:text-5xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center border border-black/5 transition-transform duration-300 group-hover:scale-110",
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="bg-[#fbfbf8] p-5 pt-4">
        <p className="text-[13px] leading-relaxed text-[#5f6368] font-medium">
          {hint}
        </p>
      </div>
      <div className={cn("h-1 w-full", toneClasses[tone].split(" ")[0])} />
    </AdminSurface>
  );
}
