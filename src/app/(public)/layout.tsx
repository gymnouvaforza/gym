import type { ReactNode } from "react";

import { CartProvider } from "@/components/cart/CartProvider";
import PublicPageShell from "@/components/marketing/PublicPageShell";
import { getCmsDocumentByKey, getFooterLegalLinks } from "@/lib/data/cms";
import { getMarketingData } from "@/lib/data/site";

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
        {children}
      </PublicPageShell>
    </CartProvider>
  );
}
