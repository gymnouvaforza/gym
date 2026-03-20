import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_COMMERCE_CURRENCY_CODE: z.string().length(3).optional(),
  NEXT_PUBLIC_COMMERCE_LOCALE: z.string().min(2).optional(),
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: z.string().url().optional(),
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
  ADMIN_ALLOWED_EMAILS: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_USER: z.string().min(1).optional(),
  COMMERCE_CURRENCY_CODE: z.string().length(3).optional(),
  COMMERCE_LOCALE: z.string().min(2).optional(),
  COMMERCE_PROVIDER: z.literal("medusa").optional(),
  STORE_ADMIN_PROVIDER: z.literal("medusa").optional(),
  MEDUSA_BACKEND_URL: z.string().url().optional(),
  MEDUSA_ADMIN_API_KEY: z.string().min(1).optional(),
  MEDUSA_PUBLISHABLE_KEY: z.string().min(1).optional(),
  MEDUSA_REGION_ID: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_COMMERCE_CURRENCY_CODE: process.env.NEXT_PUBLIC_COMMERCE_CURRENCY_CODE,
  NEXT_PUBLIC_COMMERCE_LOCALE: process.env.NEXT_PUBLIC_COMMERCE_LOCALE,
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const serverEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ADMIN_ALLOWED_EMAILS: process.env.ADMIN_ALLOWED_EMAILS,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_USER: process.env.ADMIN_USER,
  COMMERCE_CURRENCY_CODE: process.env.COMMERCE_CURRENCY_CODE,
  COMMERCE_LOCALE: process.env.COMMERCE_LOCALE,
  COMMERCE_PROVIDER: process.env.COMMERCE_PROVIDER,
  STORE_ADMIN_PROVIDER: process.env.STORE_ADMIN_PROVIDER,
  MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL,
  MEDUSA_ADMIN_API_KEY: process.env.MEDUSA_ADMIN_API_KEY,
  MEDUSA_PUBLISHABLE_KEY: process.env.MEDUSA_PUBLISHABLE_KEY,
  MEDUSA_REGION_ID: process.env.MEDUSA_REGION_ID,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

function resolvePublicSupabaseUrl() {
  return publicEnv.NEXT_PUBLIC_SUPABASE_URL ?? publicEnv.SUPABASE_URL;
}

function resolvePublicSupabaseKey() {
  return publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function resolveMedusaBackendUrl() {
  return publicEnv.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? serverEnv.MEDUSA_BACKEND_URL;
}

function resolveMedusaPublishableKey() {
  return publicEnv.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? serverEnv.MEDUSA_PUBLISHABLE_KEY;
}

function normalizeCurrencyCode(value: string | undefined) {
  const normalized = value?.trim().toUpperCase();
  return normalized && normalized.length === 3 ? normalized : null;
}

function normalizeLocale(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function hasSupabasePublicEnv() {
  return Boolean(resolvePublicSupabaseUrl() && resolvePublicSupabaseKey());
}

export function hasMedusaEnv() {
  return Boolean(resolveMedusaBackendUrl() && resolveMedusaPublishableKey());
}

export function hasSupabaseServiceRole() {
  return Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);
}

export function getCommerceProvider() {
  return serverEnv.COMMERCE_PROVIDER ?? "medusa";
}

export type StoreAdminProvider = "medusa";

export function getStoreAdminProvider(): StoreAdminProvider {
  return serverEnv.STORE_ADMIN_PROVIDER ?? "medusa";
}

export function getMedusaEnv() {
  const backendUrl = resolveMedusaBackendUrl();
  const publishableKey = resolveMedusaPublishableKey();

  if (!backendUrl || !publishableKey) {
    throw new Error(
      "Missing Medusa environment variables. Set NEXT_PUBLIC_MEDUSA_BACKEND_URL and NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY (or their server-side fallbacks MEDUSA_BACKEND_URL and MEDUSA_PUBLISHABLE_KEY).",
    );
  }

  return {
    backendUrl,
    publishableKey,
    regionId: serverEnv.MEDUSA_REGION_ID,
  };
}

export function getCommerceDisplayEnv() {
  return {
    currencyCode:
      normalizeCurrencyCode(publicEnv.NEXT_PUBLIC_COMMERCE_CURRENCY_CODE) ??
      normalizeCurrencyCode(serverEnv.COMMERCE_CURRENCY_CODE) ??
      "PEN",
    locale:
      normalizeLocale(publicEnv.NEXT_PUBLIC_COMMERCE_LOCALE) ??
      normalizeLocale(serverEnv.COMMERCE_LOCALE) ??
      "es-PE",
  };
}

export function getPublicSupabaseEnv() {
  const url = resolvePublicSupabaseUrl();
  const anonKey = resolvePublicSupabaseKey();

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase public environment variables. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url,
    anonKey,
  };
}

export function getServerSupabaseEnv() {
  return {
    ...getPublicSupabaseEnv(),
    serviceRoleKey: serverEnv.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function hasMedusaAdminEnv() {
  return Boolean(serverEnv.MEDUSA_BACKEND_URL && serverEnv.MEDUSA_ADMIN_API_KEY);
}

export function getMedusaAdminEnv() {
  if (!serverEnv.MEDUSA_BACKEND_URL || !serverEnv.MEDUSA_ADMIN_API_KEY) {
    throw new Error(
      "Missing Medusa admin credentials. Set MEDUSA_BACKEND_URL and MEDUSA_ADMIN_API_KEY.",
    );
  }

  return {
    backendUrl: serverEnv.MEDUSA_BACKEND_URL,
    adminApiKey: serverEnv.MEDUSA_ADMIN_API_KEY,
  };
}

export function getAdminAllowedEmails() {
  return (serverEnv.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function hasLocalAdminEnv() {
  return (
    process.env.NODE_ENV !== "production" &&
    Boolean(serverEnv.ADMIN_USER && serverEnv.ADMIN_PASSWORD)
  );
}

export function getLocalAdminEnv() {
  if (!hasLocalAdminEnv()) {
    return null;
  }

  return {
    user: serverEnv.ADMIN_USER!,
    password: serverEnv.ADMIN_PASSWORD!,
  };
}
