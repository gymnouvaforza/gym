import { LucideIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  description?: string;
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

export function AdminSection({
  title,
  icon: Icon,
  children,
  className,
  description,
  isCollapsible = false,
  defaultOpen = true,
}: AdminSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-6", className)}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between border-b border-black/5 pb-4 text-left focus:outline-none focus:ring-2 focus:ring-[#d71920]/10",
          isCollapsible ? "cursor-pointer hover:bg-black/[0.01] transition-colors" : "cursor-default"
        )}
        onClick={() => isCollapsible && setIsOpen(!isOpen)}
        disabled={!isCollapsible}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-[#d71920]" />
          <div>
            <h3 className="font-display text-xl font-black uppercase tracking-tighter text-[#111111]">
              {title}
            </h3>
            {description && (
              <p className="text-[11px] font-medium text-[#7a7f87] mt-0.5 uppercase tracking-wide">
                {description}
              </p>
            )}
          </div>
        </div>
        {isCollapsible && (
          <ChevronDown className={cn("h-5 w-5 text-[#7a7f87] transition-transform", isOpen && "rotate-180")} />
        )}
      </button>
      {isOpen && <div className="space-y-6">{children}</div>}
    </div>
  );
}
