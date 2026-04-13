import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Registro de socios",
  "Pantallas privadas de alta y confirmacion del acceso web del socio.",
);

export default function MemberRegisterLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
