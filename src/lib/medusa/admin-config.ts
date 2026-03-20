import { z } from "zod";

const medusaAdminEnvSchema = z.object({
  MEDUSA_ADMIN_API_KEY: z.string().min(1),
  MEDUSA_BACKEND_URL: z.string().url(),
});

export interface MedusaAdminConfig {
  adminApiKey: string;
  backendUrl: string;
}

function normalizeBackendUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function getMedusaAdminConfig(): MedusaAdminConfig {
  const env = medusaAdminEnvSchema.safeParse({
    MEDUSA_ADMIN_API_KEY: process.env.MEDUSA_ADMIN_API_KEY,
    MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL,
  });

  if (!env.success) {
    throw new Error(
      "Configura MEDUSA_BACKEND_URL y MEDUSA_ADMIN_API_KEY para usar el backoffice de tienda con Medusa.",
    );
  }

  return {
    adminApiKey: env.data.MEDUSA_ADMIN_API_KEY,
    backendUrl: normalizeBackendUrl(env.data.MEDUSA_BACKEND_URL),
  };
}
