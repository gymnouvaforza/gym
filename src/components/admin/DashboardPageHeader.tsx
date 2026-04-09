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
    <AdminSurface className={cn("px-4 py-6 sm:px-10 sm:py-8 border-black/10 shadow-sm", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex items-start gap-4 sm:gap-6">
          {Icon ? (
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center border border-[#d71920]/10 bg-[#fff5f5] text-[#d71920] shadow-sm">
              <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
          ) : null}
          <div className="space-y-2 sm:space-y-4">
            <p className="font-display text-[9px] sm:text-[11px] font-black uppercase italic tracking-[0.4em] text-[#d71920]">{eyebrow}</p>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-[#111111] uppercase leading-none">
              {title}
            </h1>
            <p className="max-w-2xl text-[13px] sm:text-[15px] font-medium leading-relaxed text-[#5f6368]">{description}</p>
          </div>
        </div>
      </header>
    </AdminSurface>
  );
}
