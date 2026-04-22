import type { StoreDashboardProduct } from "@/lib/data/store";
import type { StoreProductInput } from "@/lib/validators/store";
import { toStoreProductFormValues as originalToFormValues } from "@/lib/data/store";

export function toStoreFormValues(product?: StoreDashboardProduct | null): StoreProductInput {
  return originalToFormValues(product);
}
