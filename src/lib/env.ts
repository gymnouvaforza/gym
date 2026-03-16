import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const serverEnvSchema = publicEnvSchema.extend({
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_USER: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const serverEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_USER: process.env.ADMIN_USER,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

function resolvePublicSupabaseUrl() {
  return publicEnv.NEXT_PUBLIC_SUPABASE_URL ?? publicEnv.SUPABASE_URL;
}

function resolvePublicSupabaseKey() {
  return publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function hasSupabasePublicEnv() {
  return Boolean(resolvePublicSupabaseUrl() && resolvePublicSupabaseKey());
}

export function hasSupabaseServiceRole() {
  return Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);
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
