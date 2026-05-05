"use client";

import { ReactNode } from "react";
import { SidebarProvider } from "./SidebarProvider";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

// Re-export useSidebar for convenience
export { useSidebar, type SidebarState } from "./SidebarProvider";
