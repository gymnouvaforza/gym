const DEFAULT_COMMERCE_CURRENCY_CODE = "PEN";
const DEFAULT_COMMERCE_LOCALE = "es-PE";

function normalizeCurrencyCode(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase();
  return normalized && normalized.length === 3 ? normalized : null;
}

function normalizeLocale(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeCountryCode(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length === 2 ? normalized : null;
}

export function getDefaultCommerceCurrencyCode() {
  return (
    normalizeCurrencyCode(process.env.NEXT_PUBLIC_COMMERCE_CURRENCY_CODE) ??
    normalizeCurrencyCode(process.env.COMMERCE_CURRENCY_CODE) ??
    DEFAULT_COMMERCE_CURRENCY_CODE
  );
}

export function getDefaultCommerceLocale() {
  return (
    normalizeLocale(process.env.NEXT_PUBLIC_COMMERCE_LOCALE) ??
    normalizeLocale(process.env.COMMERCE_LOCALE) ??
    DEFAULT_COMMERCE_LOCALE
  );
}

export function getDefaultMedusaRegionName() {
  return normalizeLocale(process.env.MEDUSA_REGION_NAME) ?? "Peru";
}

export function getDefaultMedusaCountryCode() {
  return normalizeCountryCode(process.env.MEDUSA_COUNTRY_CODE) ?? "pe";
}
