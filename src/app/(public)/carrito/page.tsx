import type { Metadata } from "next";

import CartPageClient from "@/components/cart/CartPageClient";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Carrito del gimnasio",
  "Revisa tu seleccion antes de completar la recogida local en Nuova Forza.",
);

export default function CartPage() {
  return <CartPageClient />;
}
