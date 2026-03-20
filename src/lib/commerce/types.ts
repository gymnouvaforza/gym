import type { Product } from "@/data/types";

export type CommerceSource = "medusa";
export type CommerceProvider = "medusa";

export interface CommerceCatalogSnapshot {
  products: Product[];
  source: CommerceSource;
  status: "ready" | "unavailable";
  warning: string | null;
}

export interface CommerceProductSnapshot {
  product: Product | null;
  source: CommerceSource;
  status: "ready" | "unavailable" | "not_found";
  warning: string | null;
}
