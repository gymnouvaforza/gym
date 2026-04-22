import type { SiteSettings } from "@/lib/supabase/database.types";
import type { BrandingValues } from "@/lib/validators/branding";

export function toBrandingFormValues(settings: SiteSettings): BrandingValues {
  return {
    gym_name: settings.site_name,
    slogan: settings.slogan ?? "",
    description: settings.site_tagline,
    primary_color: settings.primary_color ?? "#d71920",
    secondary_color: settings.secondary_color ?? "#111111",
    logo_url: settings.logo_url,
    favicon_url: settings.favicon_url,
  };
}
