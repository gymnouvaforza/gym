import type { ReactNode } from "react";

import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";

export default async function DashboardLeadsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await assertModuleEnabledOrNotFound("leads");

  return children;
}
