"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import {
  PUBLIC_CACHE_TAGS,
  revalidatePublicCacheTags,
  type PublicCacheTag,
} from "@/lib/cache/public-cache";
import { hasSupabaseServiceRole } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  moderateMarketingTestimonialRecord,
  saveCmsDocumentRecord,
  saveMarketingContentRecord,
  saveMarketingPlansRecord,
  saveMarketingScheduleRowsRecord,
  saveMarketingTeamMembersRecord,
  saveSiteSettingsRecord,
  updateTrainingZoneRecord,
  updateLeadFollowUpRecord,
  updateLeadStatusRecord,
  deleteLeadRecord,
  updateBrandingRecord,
  updateThemeConfigRecord,
} from "@/lib/supabase/queries";
import { cmsDocumentSchema, type CmsDocumentValues } from "@/lib/validators/cms-document";
import { leadFollowUpSchema, type LeadFollowUpValues, leadStatusSchema } from "@/lib/validators/lead";
import { marketingContentSchema, type MarketingContentValues } from "@/lib/validators/marketing";
import { trainingZoneSchema, type TrainingZoneValues } from "@/lib/validators/training-zone";
import {
  moderateMarketingTestimonialSchema,
  type MarketingTestimonialModerationStatus,
} from "@/lib/validators/marketing-testimonial";
import { siteSettingsSchema, type SiteSettingsValues } from "@/lib/validators/settings";
import { brandingSchema, type BrandingValues } from "@/lib/validators/branding";
import { themeConfigSchema, type ThemeConfig } from "@/lib/validators/theme";


async function getAuthenticatedSupabase() {
  await requireAdminUser();

  if (!hasSupabaseServiceRole()) {
    throw new Error(
      "Configura SUPABASE_SERVICE_ROLE_KEY para gestionar datos reales del backoffice.",
    );
  }

  return createSupabaseAdminClient();
}

function revalidateApp(tags: PublicCacheTag[] = []) {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cms");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/marketing");
  revalidatePath("/dashboard/web");
  revalidatePath("/dashboard/info");
  revalidatePath("/dashboard/advanced");
  revalidatePath("/planes");
  revalidatePath("/horarios");
  revalidatePath("/privacidad");
  revalidatePath("/cookies");
  revalidatePath("/terminos");
  revalidatePath("/desistimiento");
  revalidatePath("/aviso-legal");
  revalidatePath("/acceso-restringido");
  revalidatePath("/tienda");
  revalidatePath("/carrito");

  if (tags.length > 0) {
    revalidatePublicCacheTags(tags);
  }
}

export async function saveSiteSettings(values: SiteSettingsValues) {
  const parsed = siteSettingsSchema.parse(values);
  const supabase = await getAuthenticatedSupabase();
  await saveSiteSettingsRecord(supabase, parsed);
  revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
}

export type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function saveMarketingContent(values: MarketingContentValues): Promise<ActionResponse> {
  try {
    const parsed = marketingContentSchema.parse(values);
    const supabase = await getAuthenticatedSupabase();

    await saveMarketingContentRecord(supabase, parsed);
    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido al guardar marketing.";
    console.error("[saveMarketingContent] Error persistence:", {
      message,
      error,
    });
    
    return { 
      success: false, 
      error: message 
    };
  }
}

export async function saveMarketingPlans(plans: MarketingContentValues["plans"]): Promise<ActionResponse> {
  try {
    const supabase = await getAuthenticatedSupabase();
    await saveMarketingPlansRecord(supabase, plans);
    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar los planes.";
    return { success: false, error: message };
  }
}

export async function saveMarketingSchedule(rows: MarketingContentValues["scheduleRows"]): Promise<ActionResponse> {
  try {
    const supabase = await getAuthenticatedSupabase();
    await saveMarketingScheduleRowsRecord(supabase, rows);
    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar los horarios.";
    return { success: false, error: message };
  }
}

export async function saveMarketingTeamMembers(members: MarketingContentValues["teamMembers"]): Promise<ActionResponse> {
  try {
    const supabase = await getAuthenticatedSupabase();
    await saveMarketingTeamMembersRecord(supabase, members);
    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar el equipo.";
    return { success: false, error: message };
  }
}

export async function saveTrainingZone(values: TrainingZoneValues): Promise<ActionResponse> {
  try {
    const parsed = trainingZoneSchema.parse(values);
    const supabase = await getAuthenticatedSupabase();

    await updateTrainingZoneRecord(supabase, parsed);
    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
    revalidatePath("/dashboard/marketing/zonas");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar la zona.";
    return { success: false, error: message };
  }
}

export async function updateLeadStatus(id: string, status: "new" | "contacted" | "closed") {
  const parsed = leadStatusSchema.parse({ status });
  const supabase = await getAuthenticatedSupabase();
  await updateLeadStatusRecord(supabase, id, parsed.status);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

export async function saveLeadFollowUp(id: string, values: LeadFollowUpValues) {
  const parsed = leadFollowUpSchema.parse(values);
  const supabase = await getAuthenticatedSupabase();
  await updateLeadFollowUpRecord(supabase, id, parsed);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

export async function saveCmsDocument(values: CmsDocumentValues) {
  const parsed = cmsDocumentSchema.parse(values);
  const supabase = await getAuthenticatedSupabase();
  await saveCmsDocumentRecord(supabase, parsed);
  revalidateApp([PUBLIC_CACHE_TAGS.cms]);
}

export async function moderateMarketingTestimonial(
  id: string,
  moderationStatus: Extract<MarketingTestimonialModerationStatus, "approved" | "rejected">,
) {
  const parsed = moderateMarketingTestimonialSchema.parse({
    id,
    moderationStatus,
  });
  const supabase = await getAuthenticatedSupabase();

  if (parsed.moderationStatus === "pending") {
    throw new Error("La moderacion manual solo permite aprobar o rechazar la resena.");
  }

  await moderateMarketingTestimonialRecord(supabase, parsed.id, parsed.moderationStatus);
  revalidatePath("/");
  revalidatePath("/mi-cuenta");
  revalidatePath("/dashboard/marketing");
  revalidatePublicCacheTags([PUBLIC_CACHE_TAGS.marketing]);
}

export async function deleteLeadAction(id: string) {
  const supabase = await getAuthenticatedSupabase();
  await deleteLeadRecord(supabase, id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/leads");
}

export async function updateBrandingAction(values: BrandingValues): Promise<ActionResponse> {
  try {
    const parsed = brandingSchema.parse(values);
    const supabase = await getAuthenticatedSupabase();

    await updateBrandingRecord(supabase, {
      gym_name: parsed.gym_name,
      slogan: parsed.slogan,
      primary_color: parsed.primary_color,
      secondary_color: parsed.secondary_color,
      logo_url: parsed.logo_url,
      favicon_url: parsed.favicon_url,
    });

    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al actualizar branding." 
    };
  }
}

export async function updateThemeAction(config: ThemeConfig): Promise<ActionResponse> {
  try {
    const parsed = themeConfigSchema.parse(config);
    const supabase = await getAuthenticatedSupabase();

    await updateThemeConfigRecord(supabase, parsed);

    revalidateApp([PUBLIC_CACHE_TAGS.marketing]);
    return { success: true };
  } catch (error) {
    console.error("DEBUG: updateThemeAction Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al actualizar la configuracion del tema."
    };
  }
}


