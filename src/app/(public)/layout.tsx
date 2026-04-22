import type { ReactNode } from "react";

import { CartProvider } from "@/features/checkout";
import PublicPageShell from "@/components/marketing/PublicPageShell";
import { getCmsDocumentByKey, getFooterLegalLinks } from "@/lib/data/cms";
import { getMarketingData } from "@/lib/data/site";
import { PageTransition } from "@/components/ui/page-transition";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [{ settings }, cookieDocument, legalLinks] = await Promise.all([
    getMarketingData(),
    getCmsDocumentByKey("system-cookie-banner"),
    getFooterLegalLinks(),
  ]);

  return (
    <CartProvider>
      <PublicPageShell
        settings={settings}
        cookieDocument={cookieDocument}
        legalLinks={legalLinks}
      >
        <PageTransition>{children}</PageTransition>
      </PublicPageShell>
    </CartProvider>
  );
}
