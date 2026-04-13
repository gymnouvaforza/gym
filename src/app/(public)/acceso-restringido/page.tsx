import type { Metadata } from "next";

import SystemStateScreen from "@/components/system/SystemStateScreen";
import { buildCmsDocumentMetadata, getCmsDocumentByKey } from "@/lib/data/cms";
import { buildNoIndexMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const document = await getCmsDocumentByKey("system-error-access");
  const metadata = buildCmsDocumentMetadata(document, "/acceso-restringido");

  return {
    ...metadata,
    ...buildNoIndexMetadata(document.title, document.summary),
  };
}

export default async function RestrictedAccessPage() {
  const document = await getCmsDocumentByKey("system-error-access");
  return <SystemStateScreen document={document} />;
}
