import type { Metadata } from "next";

import CartProcessingPageClient from "@/components/cart/CartProcessingPageClient";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Pago recibido",
  "Estamos terminando de registrar tu pedido pickup en Nuova Forza.",
);

export const dynamic = "force-dynamic";

export default async function CartProcessingPage({
  params,
}: Readonly<{
  params: Promise<{ cartId: string }>;
}>) {
  const { cartId } = await params;

  return <CartProcessingPageClient cartId={cartId} />;
}
