import type { Metadata } from "next";

import { CartPage } from "@/features/checkout";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Carrito del gimnasio",
  "Revisa tu seleccion antes de completar la recogida local en Nuova Forza.",
);

export default function ShoppingCartPage() {
  return <CartPage />;
}
