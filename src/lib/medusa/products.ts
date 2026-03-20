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
const MEDUSA_HEALTH_CACHE_MS = 5000;
const MEDUSA_HEALTH_TIMEOUT_MS = 3000;

let lastMedusaHealthCheckAt = 0;
let lastMedusaHealthError: string | null = null;

function toMedusaError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

async function assertMedusaAvailable() {
  const now = Date.now();

  if (now - lastMedusaHealthCheckAt < MEDUSA_HEALTH_CACHE_MS) {
    if (lastMedusaHealthError) {
      throw new Error(lastMedusaHealthError);
    }

    return;
  }

  const config = getMedusaStorefrontConfig();
  const healthUrl = new URL("/health", config.backendUrl).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MEDUSA_HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    lastMedusaHealthError = null;
  } catch (error) {
    const reason = toMedusaError(error, "fallo desconocido");
    lastMedusaHealthError =
      `Medusa no responde en ${config.backendUrl} (${reason}). ` +
      "Inicia el servicio con `npm run dev:medusa` y verifica MEDUSA_BACKEND_URL.";
    throw new Error(lastMedusaHealthError);
  } finally {
    clearTimeout(timeout);
    lastMedusaHealthCheckAt = now;
  }
}

function buildProductQuery() {
  const config = getMedusaStorefrontConfig();

  return {
    fields: MEDUSA_STOREFRONT_PRODUCT_FIELDS,
    limit: MEDUSA_PRODUCT_LIMIT,
    region_id: config.regionId,
  } satisfies MedusaStoreProductListParams;
}

export async function listMedusaStoreProducts(): Promise<MedusaStoreProduct[]> {
  await assertMedusaAvailable();
  const sdk = getMedusaSdk();

  try {
    const { products } = await sdk.store.product.list(buildProductQuery());
    return products as MedusaStoreProduct[];
  } catch (error) {
    throw new Error(
      `No se pudo consultar productos en Medusa Store API: ${toMedusaError(error, "fallo desconocido")}`,
    );
  }
}

export async function getMedusaStoreProductByHandle(
  handle: string,
): Promise<MedusaStoreProduct | null> {
  await assertMedusaAvailable();
  const sdk = getMedusaSdk();

  try {
    const { products } = await sdk.store.product.list({
      ...buildProductQuery(),
      handle,
      limit: 1,
    });

    return (products[0] as MedusaStoreProduct | undefined) ?? null;
  } catch (error) {
    throw new Error(
      `No se pudo consultar el producto ${handle} en Medusa Store API: ${toMedusaError(error, "fallo desconocido")}`,
    );
  }
}
