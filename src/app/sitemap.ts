import type { MetadataRoute } from "next";

import { getCommerceCatalog } from "@/lib/commerce/catalog";
import { getActiveModules } from "@/lib/data/modules";
import { getActiveProducts } from "@/lib/data/products";
import { getPublicCmsData } from "@/lib/data/cms";
import { getMarketingData } from "@/lib/data/site";
import { resolveCanonicalUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ settings }, cmsSnapshot, catalogSnapshot, activeModules] = await Promise.all([
    getMarketingData(),
    getPublicCmsData(),
    getCommerceCatalog(),
    getActiveModules(),
  ]);

  const baseEntries: MetadataRoute.Sitemap = [
    {
      changeFrequency: "weekly",
      lastModified: settings.updated_at,
      priority: 1,
      url: resolveCanonicalUrl("/"),
    },
    {
      changeFrequency: "weekly",
      lastModified: settings.updated_at,
      priority: 0.8,
      url: resolveCanonicalUrl("/horarios"),
    },
  ];

  if (activeModules.tienda) {
    baseEntries.push({
      changeFrequency: "weekly",
      lastModified: settings.updated_at,
      priority: 0.75,
      url: resolveCanonicalUrl("/tienda"),
    });
  }

  const legalEntries = cmsSnapshot.documents
    .filter((document) => document.kind === "legal" && document.is_published)
    .map((document) => ({
      changeFrequency: "monthly" as const,
      lastModified: document.updated_at,
      priority: 0.5,
      url: resolveCanonicalUrl(`/${document.slug}`),
    }));

  const productEntries =
    activeModules.tienda && catalogSnapshot.status === "ready"
      ? getActiveProducts(catalogSnapshot.products).map((product) => ({
          changeFrequency: "weekly" as const,
          priority: 0.7,
          url: resolveCanonicalUrl(`/tienda/${product.slug}`),
        }))
      : [];

  return [...baseEntries, ...legalEntries, ...productEntries];
}
