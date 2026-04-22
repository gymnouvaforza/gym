import type { ReactNode } from "react";

import StoreDashboardNav from "@/components/admin/StoreDashboardNav";
import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";

export default async function DashboardStoreLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await assertModuleEnabledOrNotFound("tienda");

  return (
    <div className="space-y-5">
      <StoreDashboardNav />
      {children}
    </div>
  );
}
