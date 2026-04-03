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
    <AdminSurface className={cn("px-5 py-5 sm:px-6", className)}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {Icon ? (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-none border border-[#d71920]/10 bg-[#fff5f5] text-[#d71920]">
              <Icon className="h-6 w-6" />
            </div>
          ) : null}
          <div className="space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#d71920]">{eyebrow}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#111111] sm:text-[2.2rem]">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[#4f5359]">{description}</p>
          </div>
        </div>
      </header>
    </AdminSurface>
  );
}
