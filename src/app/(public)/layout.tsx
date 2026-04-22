import type { ReactNode } from "react";

import { CartProvider } from "@/features/checkout";
import PublicPageShell from "@/components/marketing/PublicPageShell";
import { getActiveModules } from "@/lib/data/modules";
import { getCmsDocumentByKey, getFooterLegalLinks } from "@/lib/data/cms";
import { getMarketingData } from "@/lib/data/site";
import { PageTransition } from "@/components/ui/page-transition";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [{ settings }, cookieDocument, legalLinks, activeModules] = await Promise.all([
    getMarketingData(),
    getCmsDocumentByKey("system-cookie-banner"),
    getFooterLegalLinks(),
    getActiveModules(),
  ]);

  return (
    <CartProvider>
      <PublicPageShell
        settings={settings}
        cookieDocument={cookieDocument}
        legalLinks={legalLinks}
        activeModules={activeModules}
      >
        <PageTransition>{children}</PageTransition>
      </PublicPageShell>
    </CartProvider>
  );
}
