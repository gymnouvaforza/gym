import type { ReactNode } from "react";

import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";

export default async function DashboardCmsLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await assertModuleEnabledOrNotFound("cms");

  return children;
}
