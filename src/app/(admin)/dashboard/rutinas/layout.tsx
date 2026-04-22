import type { ReactNode } from "react";

import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";

export default async function DashboardRoutinesLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await assertModuleEnabledOrNotFound("rutinas");

  return children;
}
