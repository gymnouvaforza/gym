import type { Metadata } from "next";

import { CartProcessingPage } from "@/features/checkout";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Pago recibido",
  "Estamos terminando de registrar tu pedido pickup en Nuova Forza.",
);

export const dynamic = "force-dynamic";

export default async function CheckoutProcessingPage({
  params,
}: Readonly<{
  params: Promise<{ cartId: string }>;
}>) {
  const { cartId } = await params;

  return <CartProcessingPage cartId={cartId} />;
}
