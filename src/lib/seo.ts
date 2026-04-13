import type { Metadata } from "next";

import type { Product } from "@/data/types";
import { productCategoryLabels, productStockStatusLabels } from "@/lib/data/products";
import type { MarketingScheduleRow } from "@/lib/data/marketing-content";
import { novaForzaHomeContent } from "@/lib/data/nova-forza-content";
import type { DBCmsDocument, SiteSettings } from "@/lib/supabase/database.types";

export const SITE_URL = "https://nuovaforzagym.com";

const DEFAULT_SITE_NAME = "Nuova Forza";
const DEFAULT_OG_IMAGE_PATH = "/images/logo/logo-trans.webp";
const BRAND_SUFFIX_PATTERN = /\s*\|\s*(?:Nova|Nuova)\s+Forza(?:\s+Gym)?\s*$/i;

type JsonLd = Record<string, unknown>;

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string | null;
  imageUrl?: string | null;
  keywords?: string[] | null;
  robots?: Metadata["robots"];
  siteName?: string;
  type?: "article" | "website";
  openGraphTitle?: string;
}

interface MarketingMetadataOverrides
  extends Partial<Omit<PageMetadataOptions, "imageUrl" | "keywords" | "siteName">> {
  imageUrl?: string | null;
}

const dayOfWeekMap = {
  friday: "https://schema.org/Friday",
  monday: "https://schema.org/Monday",
  saturday: "https://schema.org/Saturday",
  sunday: "https://schema.org/Sunday",
  thursday: "https://schema.org/Thursday",
  tuesday: "https://schema.org/Tuesday",
  wednesday: "https://schema.org/Wednesday",
} as const;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripBrandSuffix(value: string) {
  return normalizeWhitespace(value).replace(BRAND_SUFFIX_PATTERN, "");
}

function parseAbsoluteUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isKnownSiteUrl(value: URL) {
  return /(?:^|\.)nuovaforzagym\.com$/i.test(value.hostname) || /(?:^|\.)novaforza\.pe$/i.test(value.hostname);
}

function buildSiteUrl(pathname = "/", search = "", hash = "") {
  return new URL(`${pathname}${search}${hash}`, SITE_URL).toString();
}

export function parseSeoKeywordsInput(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatSeoKeywordsInput(value: string[] | null | undefined) {
  return (value ?? []).join(", ");
}

export function normalizeSiteName(value: string | null | undefined) {
  const normalized = normalizeSeoCopy(value ?? "").trim();
  return normalized || DEFAULT_SITE_NAME;
}

export function normalizeSeoCopy(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return normalizeWhitespace(
    value
      .replace(/\bNova Forza\b/gi, DEFAULT_SITE_NAME)
      .replace(/\bGimnasio Nuova Forza\b/gi, DEFAULT_SITE_NAME)
      .replace(/novaforza\.pe/gi, "nuovaforzagym.com"),
  );
}

export function resolveCanonicalUrl(value: string | null | undefined) {
  const candidate = value?.trim();

  if (!candidate) {
    return SITE_URL;
  }

  const absoluteCandidate = parseAbsoluteUrl(candidate);

  if (absoluteCandidate) {
    return buildSiteUrl(
      absoluteCandidate.pathname || "/",
      absoluteCandidate.search,
      absoluteCandidate.hash,
    );
  }

  try {
    return new URL(candidate, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

export function resolveOgImageUrl(value: string | null | undefined) {
  const candidate = value?.trim() || DEFAULT_OG_IMAGE_PATH;
  const absoluteCandidate = parseAbsoluteUrl(candidate);

  if (absoluteCandidate) {
    return isKnownSiteUrl(absoluteCandidate)
      ? buildSiteUrl(
          absoluteCandidate.pathname || "/",
          absoluteCandidate.search,
          absoluteCandidate.hash,
        )
      : absoluteCandidate.toString();
  }

  try {
    return new URL(candidate, SITE_URL).toString();
  } catch {
    return new URL(DEFAULT_OG_IMAGE_PATH, SITE_URL).toString();
  }
}

export function buildNoIndexMetadata(
  title?: string,
  description?: string,
): Metadata {
  return {
    ...(title ? { title: stripBrandSuffix(normalizeSeoCopy(title)) } : {}),
    ...(description ? { description: normalizeSeoCopy(description) } : {}),
    robots: {
      follow: false,
      index: false,
    },
  };
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  imageUrl,
  keywords,
  robots,
  siteName = DEFAULT_SITE_NAME,
  type = "website",
  openGraphTitle,
}: PageMetadataOptions): Metadata {
  const normalizedSiteName = normalizeSiteName(siteName);
  const normalizedTitle = stripBrandSuffix(normalizeSeoCopy(title));
  const normalizedDescription = normalizeSeoCopy(description);
  const canonical = resolveCanonicalUrl(path);
  const ogImage = resolveOgImageUrl(imageUrl);
  const shareTitle =
    normalizeSeoCopy(openGraphTitle) || `${normalizedTitle} | ${normalizedSiteName}`;

  return {
    title: normalizedTitle,
    description: normalizedDescription,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical,
    },
    ...(robots ? { robots } : {}),
    openGraph: {
      title: shareTitle,
      description: normalizedDescription,
      url: canonical,
      siteName: normalizedSiteName,
      type,
      locale: "es_PE",
      images: [
        {
          url: ogImage,
          alt: normalizedSiteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: normalizedDescription,
      images: [ogImage],
    },
  };
}

export function buildMarketingMetadata(
  settings: SiteSettings,
  overrides: MarketingMetadataOverrides = {},
): Metadata {
  return buildPageMetadata({
    title: overrides.title ?? settings.seo_title,
    description: overrides.description ?? settings.seo_description,
    path: overrides.path ?? settings.seo_canonical_url,
    imageUrl: overrides.imageUrl ?? settings.seo_og_image_url,
    keywords: settings.seo_keywords,
    robots: overrides.robots,
    siteName: settings.site_name,
    type: overrides.type ?? "website",
    openGraphTitle: overrides.openGraphTitle,
  });
}

function buildPostalAddress(address: string | null | undefined) {
  const normalizedAddress = normalizeSeoCopy(address);

  if (!normalizedAddress) {
    return undefined;
  }

  return {
    "@type": "PostalAddress",
    addressCountry: /peru|chiclayo/i.test(normalizedAddress) ? "PE" : undefined,
    addressLocality: /chiclayo/i.test(normalizedAddress) ? "Chiclayo" : undefined,
    streetAddress: normalizedAddress,
  };
}

function mapScheduleLabelToDays(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("lunes") && normalized.includes("viernes")) {
    return [
      dayOfWeekMap.monday,
      dayOfWeekMap.tuesday,
      dayOfWeekMap.wednesday,
      dayOfWeekMap.thursday,
      dayOfWeekMap.friday,
    ];
  }

  if (normalized.includes("sab")) {
    return [dayOfWeekMap.saturday];
  }

  if (normalized.includes("dom")) {
    return [dayOfWeekMap.sunday];
  }

  return [];
}

function normalizeTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);

  if (!match) {
    return null;
  }

  const [, rawHours, minutes, meridiem] = match;
  let hours = Number(rawHours);

  if (Number.isNaN(hours)) {
    return null;
  }

  if (meridiem === "AM") {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function buildOpeningHoursSpecification(rows: MarketingScheduleRow[]) {
  return rows
    .filter((row) => row.is_active && row.description?.toLowerCase() !== "cerrado")
    .map((row) => {
      const dayOfWeek = mapScheduleLabelToDays(row.label);
      const opens = normalizeTime(row.opens_at);
      const closes = normalizeTime(row.closes_at);

      if (!dayOfWeek.length || !opens || !closes) {
        return null;
      }

      return {
        "@type": "OpeningHoursSpecification",
        closes,
        dayOfWeek,
        opens,
      };
    })
    .filter((entry) => entry !== null);
}

export function buildOrganizationJsonLd(settings: SiteSettings): JsonLd {
  const siteName = normalizeSiteName(settings.site_name);

  return {
    "@context": "https://schema.org",
    "@id": `${SITE_URL}/#organization`,
    "@type": "Organization",
    email: settings.contact_email || undefined,
    logo: resolveOgImageUrl(DEFAULT_OG_IMAGE_PATH),
    name: siteName,
    sameAs: novaForzaHomeContent.socials.map((item) => item.href),
    telephone: settings.contact_phone || undefined,
    url: SITE_URL,
  };
}

export function buildWebsiteJsonLd(settings: SiteSettings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@id": `${SITE_URL}/#website`,
    "@type": "WebSite",
    inLanguage: "es-PE",
    name: normalizeSiteName(settings.site_name),
    url: SITE_URL,
  };
}

export function buildGymJsonLd(
  settings: SiteSettings,
  scheduleRows: MarketingScheduleRow[],
): JsonLd {
  const openingHoursSpecification = buildOpeningHoursSpecification(scheduleRows);

  return {
    "@context": "https://schema.org",
    "@id": `${SITE_URL}/#gym`,
    "@type": "SportsActivityLocation",
    address: buildPostalAddress(settings.address),
    email: settings.contact_email || undefined,
    image: resolveOgImageUrl(settings.seo_og_image_url),
    name: normalizeSiteName(settings.site_name),
    sameAs: novaForzaHomeContent.socials.map((item) => item.href),
    telephone: settings.contact_phone || undefined,
    url: SITE_URL,
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{
    name: string;
    path: string;
  }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: resolveCanonicalUrl(item.path),
      name: item.name,
      position: index + 1,
    })),
  };
}

function resolveProductAvailability(product: Product) {
  switch (product.stock_status) {
    case "in_stock":
    case "low_stock":
      return "https://schema.org/InStock";
    case "coming_soon":
      return "https://schema.org/PreOrder";
    case "out_of_stock":
    default:
      return "https://schema.org/OutOfStock";
  }
}

export function buildProductJsonLd(product: Product): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: {
      "@type": "Brand",
      name: DEFAULT_SITE_NAME,
    },
    category: productCategoryLabels[product.category],
    description: normalizeSeoCopy(product.short_description || product.description),
    image: product.images.map((image) => resolveOgImageUrl(image)),
    name: normalizeSeoCopy(product.name),
    offers: {
      "@type": "Offer",
      availability: resolveProductAvailability(product),
      price: product.price.toFixed(2),
      priceCurrency: product.currency.toUpperCase(),
      url: resolveCanonicalUrl(`/tienda/${product.slug}`),
    },
    sku: product.variants?.find((variant) => variant.sku)?.sku ?? undefined,
  };
}

export function buildCmsDocumentMetadata(
  document: DBCmsDocument,
  canonicalPath?: string,
): Metadata {
  const title = stripBrandSuffix(document.seo_title || document.title);
  const description = normalizeSeoCopy(document.seo_description || document.summary);
  const canonical = resolveCanonicalUrl(canonicalPath ?? `/${document.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      follow: document.kind === "legal",
      index: document.kind === "legal" && document.is_published,
    },
    openGraph: {
      title: `${title} | ${DEFAULT_SITE_NAME}`,
      description,
      url: canonical,
      type: document.kind === "legal" ? "article" : "website",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${DEFAULT_SITE_NAME}`,
      description,
    },
  };
}

export function serializeJsonLd(data: JsonLd | JsonLd[]) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export { DEFAULT_SITE_NAME, DEFAULT_OG_IMAGE_PATH, productStockStatusLabels };
