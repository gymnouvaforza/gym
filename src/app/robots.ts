import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE_URL,
    rules: {
      allow: "/",
      disallow: ["/api/", "/dashboard", "/login"],
      userAgent: "*",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
