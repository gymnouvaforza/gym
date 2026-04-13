import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Area privada de socios",
  "Panel privado para socios y seguimiento de pedidos o membresias.",
);

export default function MemberAccountLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
