import type { SiteSettings } from "@/lib/supabase/database.types";

export const topbarVariants = ["announcement", "promotion", "notice"] as const;

export type TopbarVariant = (typeof topbarVariants)[number];

export interface ActiveTopbar {
  variant: TopbarVariant;
  text: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  expiresAt: string;
}

export function isTopbarVariant(value: string | null | undefined): value is TopbarVariant {
  return topbarVariants.includes((value ?? "") as TopbarVariant);
}

export function resolveTopbarVariant(value: string | null | undefined): TopbarVariant {
  return isTopbarVariant(value) ? value : "announcement";
}

export function formatDateTimeLocalInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function toIsoDateTimeOrNull(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function formatTopbarDeadline(value: string, locale = "es-PE") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function resolveActiveTopbar(
  settings: Pick<
    SiteSettings,
    "topbar_enabled" | "topbar_variant" | "topbar_text" | "topbar_cta_label" | "topbar_cta_url" | "topbar_expires_at"
  >,
  now = new Date(),
): ActiveTopbar | null {
  if (!settings.topbar_enabled) {
    return null;
  }

  const text = settings.topbar_text?.trim();

  if (!text) {
    return null;
  }

  const expiresAt = settings.topbar_expires_at?.trim();

  if (!expiresAt) {
    return null;
  }

  const expiresAtDate = new Date(expiresAt);

  if (Number.isNaN(expiresAtDate.getTime()) || expiresAtDate <= now) {
    return null;
  }

  const ctaLabel = settings.topbar_cta_label?.trim() || null;
  const ctaUrl = settings.topbar_cta_url?.trim() || null;

  return {
    variant: resolveTopbarVariant(settings.topbar_variant),
    text,
    ctaLabel: ctaLabel && ctaUrl ? ctaLabel : null,
    ctaUrl: ctaLabel && ctaUrl ? ctaUrl : null,
    expiresAt,
  };
}

export function resolveTopbarStatus(
  settings: Pick<SiteSettings, "topbar_enabled" | "topbar_text" | "topbar_expires_at">,
  now = new Date(),
) {
  if (!settings.topbar_enabled || !settings.topbar_text?.trim()) {
    return "inactive" as const;
  }

  const expiresAt = settings.topbar_expires_at?.trim();

  if (!expiresAt) {
    return "inactive" as const;
  }

  const expiresAtDate = new Date(expiresAt);

  if (Number.isNaN(expiresAtDate.getTime()) || expiresAtDate <= now) {
    return "expired" as const;
  }

  return "active" as const;
}
