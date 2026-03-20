import { cache } from "react";

import { getCommerceProvider } from "@/lib/env";

import { getMedusaCommerceProductBySlug, getMedusaCommerceProducts } from "./medusa";
import type {
  CommerceCatalogSnapshot,
  CommerceProductSnapshot,
  CommerceProvider,
} from "./types";

async function loadMedusaCatalog(): Promise<CommerceCatalogSnapshot> {
  return {
    products: await getMedusaCommerceProducts(),
    source: "medusa",
    status: "ready",
    warning: null,
  };
}

async function loadMedusaProduct(slug: string): Promise<CommerceProductSnapshot> {
  const product = await getMedusaCommerceProductBySlug(slug);

  return {
    product,
    source: "medusa",
    status: product ? "ready" : "not_found",
    warning: null,
  };
}

export const getCommerceCatalog = cache(async (): Promise<CommerceCatalogSnapshot> => {
  const provider: CommerceProvider = getCommerceProvider();

  try {
    if (provider !== "medusa") {
      throw new Error(`Proveedor de commerce no soportado: ${provider}`);
    }

    return await loadMedusaCatalog();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo consultar el catalogo en Medusa.";

    return {
      products: [],
      source: "medusa",
      status: "unavailable",
      warning: message,
    };
  }
});

export const getCommerceProductBySlug = cache(
  async (slug: string): Promise<CommerceProductSnapshot> => {
    const provider: CommerceProvider = getCommerceProvider();

    try {
      if (provider !== "medusa") {
        throw new Error(`Proveedor de commerce no soportado: ${provider}`);
      }

      return await loadMedusaProduct(slug);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `No se pudo consultar el producto ${slug} en Medusa.`;

      return {
        product: null,
        source: "medusa",
        status: "unavailable",
        warning: message,
      };
    }
  },
);
