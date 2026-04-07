import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import AdminSurface from "./AdminSurface";

interface DashboardPageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  icon?: LucideIcon;
  className?: string;
}

export default function DashboardPageHeader({
  title,
  description,
  eyebrow = "Backoffice",
  icon: Icon,
  className,
}: DashboardPageHeaderProps) {
  return (
    <AdminSurface className={cn("px-6 py-8 sm:px-10 border-black/10", className)}>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-6">
          {Icon ? (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-[#d71920]/10 bg-[#fff5f5] text-[#d71920] shadow-sm">
              <Icon className="h-7 w-7" />
            </div>
          ) : null}
          <div className="space-y-4">
            <p className="font-display text-[11px] font-black uppercase italic tracking-[0.4em] text-[#d71920]">{eyebrow}</p>
            <h1 className="font-display text-4xl font-black italic tracking-tighter text-[#111111] sm:text-5xl uppercase leading-none">
              {title}
            </h1>
            <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-[#5f6368]">{description}</p>
          </div>
        </div>
      </header>
    </AdminSurface>
  );
}
