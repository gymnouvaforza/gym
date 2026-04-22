import type { SiteSettings } from "@/lib/supabase/database.types";
import { formatSeoKeywordsInput } from "@/lib/seo";
import { resolveTopbarVariant, formatDateTimeLocalInput } from "@/lib/topbar";
import type { SiteSettingsValues } from "@/lib/validators/settings";

export function toConfigFormValues(settings: SiteSettings): SiteSettingsValues {
  return {
    ...settings,
    topbar_variant: resolveTopbarVariant(settings.topbar_variant),
    topbar_text: settings.topbar_text ?? "",
    topbar_cta_label: settings.topbar_cta_label ?? "",
    topbar_cta_url: settings.topbar_cta_url ?? "",
    topbar_expires_at: formatDateTimeLocalInput(settings.topbar_expires_at),
    notification_email: settings.notification_email,
    transactional_from_email: settings.transactional_from_email,
    contact_phone: settings.contact_phone ?? "",
    whatsapp_url: settings.whatsapp_url ?? "",
    address: settings.address ?? "",
    opening_hours: settings.opening_hours ?? "",
    hero_video_url: settings.hero_video_url ?? "",
    seo_keywords: formatSeoKeywordsInput(settings.seo_keywords),
    seo_canonical_url: settings.seo_canonical_url ?? "",
    seo_og_image_url: settings.seo_og_image_url ?? "",
  };
}
