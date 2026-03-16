"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser, isLocalAdminSession } from "@/lib/auth";
import { hasSupabaseServiceRole } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { saveSiteSettingsRecord, updateLeadStatusRecord } from "@/lib/supabase/queries";
import { leadStatusSchema } from "@/lib/validators/lead";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validators/settings";

async function getAuthenticatedSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (await isLocalAdminSession()) {
    if (!hasSupabaseServiceRole()) {
      throw new Error(
        "La sesion local necesita SUPABASE_SERVICE_ROLE_KEY para editar datos reales del backoffice.",
      );
    }

    return createSupabaseAdminClient();
  }

  return createSupabaseServerClient();
}

function revalidateApp() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/settings");
}

export async function saveSiteSettings(values: SiteSettingsValues) {
  const parsed = siteSettingsSchema.parse(values);
  const supabase = await getAuthenticatedSupabase();
  await saveSiteSettingsRecord(supabase, parsed);
  revalidateApp();
}

export async function updateLeadStatus(id: string, status: "new" | "contacted" | "closed") {
  const parsed = leadStatusSchema.parse({ status });
  const supabase = await getAuthenticatedSupabase();
  await updateLeadStatusRecord(supabase, id, parsed.status);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}
