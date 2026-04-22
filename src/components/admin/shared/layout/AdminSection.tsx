"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  description?: string;
  className?: string;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

export function AdminSection({
  title,
  icon: Icon,
  children,
  description,
  className,
  isCollapsible = false,
  defaultOpen = false,
}: AdminSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerContent = (
    <div className="flex min-w-0 items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#d71920]" />
      <div className="min-w-0">
        <h3 className="font-display text-xl font-black uppercase tracking-tighter text-[#111111]">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[#5f6368]">{description}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {isCollapsible ? (
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 border-b border-black/5 pb-4 text-left"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {headerContent}
          <ChevronDown
            className={cn(
              "mt-1 h-5 w-5 shrink-0 text-[#7a7f87] transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
      ) : (
        <div className="border-b border-black/5 pb-4">{headerContent}</div>
      )}
      {isCollapsible ? (isOpen ? <div className="space-y-6">{children}</div> : null) : (
        <div className="space-y-6">{children}</div>
      )}
    </div>
  );
}
