import type { ReactNode } from "react";

import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";

export default async function DashboardMarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await assertModuleEnabledOrNotFound("marketing");

  return children;
}
