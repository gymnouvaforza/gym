"use client";

import DashboardSidebar from "./DashboardSidebar";
import { useSidebar } from "./SidebarProvider";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import { cn } from "@/lib/utils";

interface SidebarContainerProps {
  activeModules: SystemModuleStateMap;
  isSuperadmin: boolean;
}

export default function SidebarContainer({ activeModules, isSuperadmin }: SidebarContainerProps) {
  const { state } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-white/5 bg-[#111111] transition-all duration-300 xl:block",
        state === "expanded" && "w-[260px] 2xl:w-[280px]",
        state === "icons" && "w-[72px]",
        state === "hidden" && "w-0 overflow-hidden border-r-0"
      )}
    >
      <DashboardSidebar activeModules={activeModules} isSuperadmin={isSuperadmin} />
    </aside>
  );
}
