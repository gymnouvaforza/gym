"use client";

import { BarChart3, Inbox, LayoutTemplate, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Resumen", icon: BarChart3 },
  { href: "/dashboard/content", label: "Contenido", icon: LayoutTemplate },
  { href: "/dashboard/leads", label: "Leads", icon: Inbox },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings2 },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 p-4 lg:w-64">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f87171]">Nova Forza</p>
          <p className="mt-2 text-sm text-zinc-400">Una sola base. Un panel simple.</p>
        </div>
        <Badge variant="muted">internal</Badge>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/6 hover:text-white",
                isActive && "bg-[#d71920]/15 text-white",
              )}
            >
              <Icon className={cn("h-4 w-4 text-[#fca5a5]", isActive && "text-white")} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
