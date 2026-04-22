import type { ReactNode } from "react";

import { assertModuleEnabledOrNotFound } from "@/lib/data/modules";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await assertModuleEnabledOrNotFound("tienda");

  return children;
}
