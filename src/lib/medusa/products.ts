import {
  MEDUSA_STOREFRONT_PRODUCT_FIELDS,
  getMedusaStorefrontConfig,
} from "@/lib/medusa/config";
import { getMedusaSdk } from "@/lib/medusa/sdk";
import type {
  MedusaStoreProduct,
  MedusaStoreProductListParams,
} from "@/lib/medusa/storefront-types";

const MEDUSA_PRODUCT_LIMIT = 100;

function buildProductQuery() {
  const config = getMedusaStorefrontConfig();

  return {
    fields: MEDUSA_STOREFRONT_PRODUCT_FIELDS,
    limit: MEDUSA_PRODUCT_LIMIT,
    region_id: config.regionId,
    country_code: config.countryCode,
  } satisfies MedusaStoreProductListParams;
}

export async function listMedusaStoreProducts(): Promise<MedusaStoreProduct[]> {
  const sdk = getMedusaSdk();
  const { products } = await sdk.store.product.list(buildProductQuery());
  return products as MedusaStoreProduct[];
}

export async function getMedusaStoreProductByHandle(
  handle: string,
): Promise<MedusaStoreProduct | null> {
  const sdk = getMedusaSdk();
  const { products } = await sdk.store.product.list({
    ...buildProductQuery(),
    handle,
    limit: 1,
  });

  return (products[0] as MedusaStoreProduct | undefined) ?? null;
}
