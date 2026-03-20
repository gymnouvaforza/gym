#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const { createClient } = require("@supabase/supabase-js");

loadEnvFiles();

const ROOT_DIR = path.resolve(__dirname, "..");
const MEDUSA_DIR = path.join(ROOT_DIR, "apps", "medusa");
function loadEnvFiles() {
  const rootDir = path.resolve(__dirname, "..");
  const envFiles = [
    path.join(rootDir, ".env"),
    path.join(rootDir, ".env.local"),
    path.join(rootDir, "apps", "medusa", ".env"),
    path.join(rootDir, "apps", "medusa", ".env.local"),
  ];

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const fileContent = fs.readFileSync(envFile, "utf8");
      const parsed = parseEnvFile(fileContent);

      for (const [key, value] of Object.entries(parsed)) {
        process.env[key] = value;
      }
    }
  }
}

function parseEnvFile(content) {
  const result = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const valueRaw = line.slice(separator + 1).trim();

    if (!key) {
      continue;
    }

    const unquoted =
      (valueRaw.startsWith('"') && valueRaw.endsWith('"')) ||
      (valueRaw.startsWith("'") && valueRaw.endsWith("'"))
        ? valueRaw.slice(1, -1)
        : valueRaw;

    result[key] = unquoted;
  }

  return result;
}

function resolveSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function fail(message, details) {
  console.error(`[sync-store-supabase-to-medusa] ERROR: ${message}`);

  if (details) {
    if (details instanceof Error) {
      console.error(details.stack || details.message);
    } else {
      console.error(details);
    }
  }

  process.exit(1);
}

function assertEnv(name, value) {
  if (!value) {
    fail(`Missing required environment variable: ${name}`);
  }

  return value;
}

function toPublicAssetUrl(value, baseUrl) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (!value.startsWith("/")) {
    return `${baseUrl.replace(/\/$/, "")}/${value}`;
  }

  return `${baseUrl.replace(/\/$/, "")}${value}`;
}

function buildSyncInput(categories, products) {
  const assetBaseUrl =
    process.env.MEDUSA_SYNC_ASSET_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";

  return {
    categories: categories.map((category) => ({
      id: category.id,
      active: category.active,
      description: category.description,
      medusa_category_id: category.medusa_category_id,
      name: category.name,
      order: category.order,
      parent_id: category.parent_id,
      slug: category.slug,
    })),
    products: products.map((product) => ({
      active: product.active,
      benefits: Array.isArray(product.benefits) ? product.benefits : [],
      category: product.category,
      category_id: product.category_id,
      compare_price: product.compare_price,
      cta_label: product.cta_label,
      currency: product.currency,
      description: product.description,
      discount_label: product.discount_label,
      eyebrow: product.eyebrow,
      featured: product.featured,
      highlights: Array.isArray(product.highlights) ? product.highlights : [],
      id: product.id,
      images: (Array.isArray(product.images) ? product.images : [])
        .map((image) => toPublicAssetUrl(image, assetBaseUrl))
        .filter(Boolean),
      medusa_product_id: product.medusa_product_id,
      name: product.name,
      order: product.order,
      pickup_eta: product.pickup_eta,
      pickup_note: product.pickup_note,
      pickup_only: product.pickup_only,
      pickup_summary: product.pickup_summary,
      price: product.price,
      short_description: product.short_description,
      slug: product.slug,
      specifications:
        product.specifications && typeof product.specifications === "object"
          ? product.specifications
          : {},
      stock_status: product.stock_status,
      tags: Array.isArray(product.tags) ? product.tags : [],
      usage_steps: Array.isArray(product.usage_steps) ? product.usage_steps : [],
    })),
  };
}

function runMedusaSync(syncInput) {
  if (!fs.existsSync(MEDUSA_DIR)) {
    fail("Medusa app directory was not found.", MEDUSA_DIR);
  }

  const medusaTempDir = path.join(MEDUSA_DIR, "src", "scripts", "temp");
  if (!fs.existsSync(medusaTempDir)) {
    fs.mkdirSync(medusaTempDir, { recursive: true });
  }

  const medusaScriptFile = path.join(medusaTempDir, "supabase-sync.ts");
  const inputFile = path.join(medusaTempDir, "input.json");
  const outputFile = path.join(medusaTempDir, "output.json");

  fs.writeFileSync(inputFile, JSON.stringify(syncInput, null, 2));
  fs.writeFileSync(outputFile, JSON.stringify({ categories: [], products: [] }, null, 2));
  fs.writeFileSync(medusaScriptFile, buildMedusaExecScript(), "utf8");

  const relativeMedusaScript = "src/scripts/temp/supabase-sync.ts";

  const medusaExecBin = "npx";
  const command = spawnSync(medusaExecBin, ["medusa", "exec", relativeMedusaScript], {
    cwd: MEDUSA_DIR,
    shell: true,
    env: {
      ...process.env,
      MEDUSA_SUPABASE_SYNC_INPUT: inputFile,
      MEDUSA_SUPABASE_SYNC_OUTPUT: outputFile,
    },
    encoding: "utf8",
    stdio: "pipe",
  });

  if (command.stdout) {
    process.stdout.write(command.stdout);
  }

  if (command.stderr) {
    process.stderr.write(command.stderr);
  }

  // Cleanup temp files
  try {
    if (fs.existsSync(medusaScriptFile)) fs.unlinkSync(medusaScriptFile);
  } catch {}

  if (command.status !== 0) {
    fail(`Medusa sync execution failed with exit code ${command.status ?? "unknown"}.`);
  }

  if (!fs.existsSync(outputFile)) {
    fail("Medusa sync finished without producing an output file.");
  }

  try {
    return JSON.parse(fs.readFileSync(outputFile, "utf8"));
  } catch (error) {
    fail("Could not parse Medusa sync output.", error);
  }
}

function buildMedusaExecScript() {
  return `
import fs from "fs";
import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  updateProductCategoriesWorkflow,
  updateProductsWorkflow,
} from "@medusajs/medusa/core-flows";

type SyncCategory = {
  id: string;
  active: boolean;
  description: string | null;
  medusa_category_id: string | null;
  name: string;
  order: number;
  parent_id: string | null;
  slug: string;
};

type SyncProduct = {
  active: boolean;
  benefits: string[];
  category: string;
  category_id: string | null;
  compare_price: number | null;
  cta_label: string;
  currency: string;
  description: string;
  discount_label: string | null;
  eyebrow: string | null;
  featured: boolean;
  highlights: string[];
  id: string;
  images: string[];
  medusa_product_id: string | null;
  name: string;
  order: number;
  pickup_eta: string | null;
  pickup_note: string | null;
  pickup_only: boolean;
  pickup_summary: string | null;
  price: number;
  short_description: string;
  slug: string;
  specifications: Record<string, unknown>;
  stock_status: string;
  tags: string[];
  usage_steps: string[];
};

type SyncInput = {
  categories: SyncCategory[];
  products: SyncProduct[];
};

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJsonFile(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function sortCategories(categories: SyncCategory[]) {
  const pending = new Map(categories.map((category) => [category.id, category]));
  const sorted: SyncCategory[] = [];

  while (pending.size > 0) {
    const ready = Array.from(pending.values())
      .filter((category) => !category.parent_id || sorted.some((entry) => entry.id === category.parent_id))
      .sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, "es"));

    if (ready.length === 0) {
      throw new Error("Category tree contains unresolved parent references.");
    }

    for (const category of ready) {
      sorted.push(category);
      pending.delete(category.id);
    }
  }

  return sorted;
}

function toMinorUnits(amount: number) {
  return Math.round(Number(amount || 0) * 100);
}

function toProductStatus(active: boolean) {
  return active ? ProductStatus.PUBLISHED : ProductStatus.DRAFT;
}

function buildProductMetadata(product: SyncProduct) {
  return {
    benefits: product.benefits,
    category: product.category,
    compare_price: product.compare_price,
    cta_label: product.cta_label,
    discount_label: product.discount_label,
    eyebrow: product.eyebrow,
    featured: product.featured,
    highlights: product.highlights,
    pickup_eta: product.pickup_eta,
    pickup_note: product.pickup_note,
    pickup_only: product.pickup_only,
    pickup_summary: product.pickup_summary,
    short_description: product.short_description,
    specifications: product.specifications,
    stock_status: product.stock_status,
    storefront_images: product.images,
    supabase_product_id: product.id,
    tags: product.tags,
    usage_steps: product.usage_steps,
    order: product.order,
  };
}

function buildSku(product: SyncProduct) {
  return "SB-" + product.slug.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toUpperCase();
}

async function syncCategories(
  container: ExecArgs["container"],
  categories: SyncCategory[],
  logger: { info(message: string): void },
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  });

  const byHandle = new Map(
    (existingCategories ?? []).map((category: { id: string; handle?: string | null }) => [
      category.handle ?? "",
      category,
    ]),
  );
  const byId = new Map(
    (existingCategories ?? []).map((category: { id: string }) => [category.id, category]),
  );
  const supabaseToMedusaId = new Map<string, string>();
  const results: Array<{ action: string; handle: string; medusa_id: string; supabase_id: string }> = [];

  for (const category of sortCategories(categories)) {
    const parentMedusaId = category.parent_id ? supabaseToMedusaId.get(category.parent_id) ?? null : null;
    const existing =
      (category.medusa_category_id ? byId.get(category.medusa_category_id) : null) ??
      byHandle.get(category.slug) ??
      null;

    const payload = {
      description: category.description ?? undefined,
      handle: category.slug,
      is_active: category.active,
      metadata: {
        supabase_category_id: category.id,
      },
      name: category.name,
      parent_category_id: parentMedusaId,
      rank: category.order,
    };

    if (existing) {
      const { result } = await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: {
            id: existing.id,
          },
          update: payload,
        },
      });

      const updated = result[0];
      supabaseToMedusaId.set(category.id, updated.id);
      byHandle.set(category.slug, updated);
      byId.set(updated.id, updated);
      results.push({
        action: "updated",
        handle: category.slug,
        medusa_id: updated.id,
        supabase_id: category.id,
      });
      logger.info("Updated Medusa category " + category.slug);
      continue;
    }

    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [payload],
      },
    });

    const created = result[0];
    supabaseToMedusaId.set(category.id, created.id);
    byHandle.set(category.slug, created);
    byId.set(created.id, created);
    results.push({
      action: "created",
      handle: category.slug,
      medusa_id: created.id,
      supabase_id: category.id,
    });
    logger.info("Created Medusa category " + category.slug);
  }

  return {
    results,
    supabaseToMedusaId,
  };
}

async function syncProducts(
  container: ExecArgs["container"],
  products: SyncProduct[],
  categoryLinks: Map<string, string>,
  logger: { info(message: string): void },
) {
  const storeModuleService = container.resolve(Modules.STORE);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const [store] = await storeModuleService.listStores();
  if (!store?.default_sales_channel_id) {
    throw new Error("Medusa store is missing default_sales_channel_id. Run the Nova seed first.");
  }

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
  const shippingProfile = shippingProfiles[0];

  if (!shippingProfile?.id) {
    throw new Error("Medusa default shipping profile was not found. Run the Nova seed first.");
  }

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id", "variants.title", "variants.sku"],
  });

  const byHandle = new Map(
    (existingProducts ?? []).map((product: { id: string; handle?: string | null }) => [
      product.handle ?? "",
      product,
    ]),
  );
  const byId = new Map(
    (existingProducts ?? []).map((product: { id: string }) => [product.id, product]),
  );
  const results: Array<{ action: string; handle: string; medusa_id: string; supabase_id: string }> = [];

  for (const product of products.sort((left, right) => left.order - right.order || left.name.localeCompare(right.name, "es"))) {
    if (!product.category_id) {
      throw new Error("Product " + product.slug + " does not have category_id in Supabase.");
    }

    const medusaCategoryId = categoryLinks.get(product.category_id);
    if (!medusaCategoryId) {
      throw new Error("Product " + product.slug + " references category " + product.category_id + " that was not synced to Medusa.");
    }

    const existing =
      (product.medusa_product_id ? byId.get(product.medusa_product_id) : null) ??
      byHandle.get(product.slug) ??
      null;

    const firstImage = product.images[0] ?? null;
    const variantPayload = {
      allow_backorder: false,
      manage_inventory: false,
      options: {
        Presentacion: "Unica",
      },
      prices: [
        {
          amount: toMinorUnits(product.price),
          currency_code: String(
            product.currency || process.env.COMMERCE_CURRENCY_CODE || "PEN",
          ).toLowerCase(),
        },
      ],
      sku: buildSku(product),
      title: "Default",
    };

    const basePayload = {
      category_ids: [medusaCategoryId],
      description: product.description,
      discountable: true,
      handle: product.slug,
      images: product.images.map((url) => ({ url })),
      metadata: buildProductMetadata(product),
      shipping_profile_id: shippingProfile.id,
      status: toProductStatus(product.active),
      subtitle: product.short_description,
      thumbnail: firstImage,
      title: product.name,
      sales_channels: [{ id: store.default_sales_channel_id }],
    };

    if (existing) {
      const existingVariantId = Array.isArray(existing.variants) ? existing.variants[0]?.id : undefined;

      const { result } = await updateProductsWorkflow(container).run({
        input: {
          products: [
            {
              ...basePayload,
              id: existing.id,
              options: [
                {
                  title: "Presentacion",
                  values: ["Unica"],
                },
              ],
              variants: [
                {
                  ...variantPayload,
                  id: existingVariantId,
                },
              ],
            },
          ],
        },
      });

      const updated = result[0];
      byHandle.set(product.slug, updated);
      byId.set(updated.id, updated);
      results.push({
        action: "updated",
        handle: product.slug,
        medusa_id: updated.id,
        supabase_id: product.id,
      });
      logger.info("Updated Medusa product " + product.slug);
      continue;
    }

    const { result } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            ...basePayload,
            options: [
              {
                title: "Presentacion",
                values: ["Unica"],
              },
            ],
            variants: [variantPayload],
          },
        ],
      },
    });

    const created = result[0];
    byHandle.set(product.slug, created);
    byId.set(created.id, created);
    results.push({
      action: "created",
      handle: product.slug,
      medusa_id: created.id,
      supabase_id: product.id,
    });
    logger.info("Created Medusa product " + product.slug);
  }

  return results;
}

export default async function syncSupabaseStoreToMedusa({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const inputPath = process.env.MEDUSA_SUPABASE_SYNC_INPUT;
  const outputPath = process.env.MEDUSA_SUPABASE_SYNC_OUTPUT;

  if (!inputPath || !outputPath) {
    throw new Error("Missing MEDUSA_SUPABASE_SYNC_INPUT or MEDUSA_SUPABASE_SYNC_OUTPUT.");
  }

  const input = readJsonFile<SyncInput>(inputPath);

  logger.info("Starting Supabase -> Medusa sync.");

  const categorySync = await syncCategories(container, input.categories, logger);
  const productResults = await syncProducts(container, input.products, categorySync.supabaseToMedusaId, logger);

  writeJsonFile(outputPath, {
    categories: categorySync.results,
    products: productResults,
  });

  logger.info("Supabase -> Medusa sync finished.");
}
`;
}

async function updateSupabaseLinks(supabase, syncResult) {
  for (const category of syncResult.categories || []) {
    const { error } = await supabase
      .from("store_categories")
      .update({ medusa_category_id: category.medusa_id })
      .eq("id", category.supabase_id);

    if (error) {
      throw new Error(
        `Failed to persist medusa_category_id for category ${category.handle}: ${error.message}`,
      );
    }
  }

  for (const product of syncResult.products || []) {
    const { error } = await supabase
      .from("products")
      .update({ medusa_product_id: product.medusa_id })
      .eq("id", product.supabase_id);

    if (error) {
      throw new Error(
        `Failed to persist medusa_product_id for product ${product.handle}: ${error.message}`,
      );
    }
  }
}

async function main() {
  const supabaseUrl = assertEnv(
    "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
    resolveSupabaseUrl(),
  );
  const serviceRoleKey = assertEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: categories, error: categoriesError } = await supabase
    .from("store_categories")
    .select("id, active, description, medusa_category_id, name, order, parent_id, slug")
    .order("order", { ascending: true })
    .order("name", { ascending: true });

  if (categoriesError) {
    fail("Could not load store_categories from Supabase.", categoriesError.message);
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id,
      active,
      benefits,
      category,
      category_id,
      compare_price,
      cta_label,
      currency,
      description,
      discount_label,
      eyebrow,
      featured,
      highlights,
      images,
      medusa_product_id,
      name,
      order,
      pickup_eta,
      pickup_note,
      pickup_only,
      pickup_summary,
      price,
      short_description,
      slug,
      specifications,
      stock_status,
      tags,
      usage_steps
    `)
    .order("order", { ascending: true })
    .order("name", { ascending: true });

  if (productsError) {
    fail("Could not load products from Supabase.", productsError.message);
  }

  const syncInput = buildSyncInput(categories || [], products || []);

  console.log(
    `[sync-store-supabase-to-medusa] Loaded ${syncInput.categories.length} categories and ${syncInput.products.length} products from Supabase.`,
  );

  const syncResult = runMedusaSync(syncInput);
  await updateSupabaseLinks(supabase, syncResult);

  console.log(
    `[sync-store-supabase-to-medusa] Sync completed. Categories: ${syncResult.categories.length}. Products: ${syncResult.products.length}.`,
  );
}

main().catch((error) => fail("Fatal sync failure.", error));
