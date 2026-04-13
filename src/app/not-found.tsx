import type { Metadata } from "next";

import SystemStateScreen from "@/components/system/SystemStateScreen";
import { getCmsDocumentByKey } from "@/lib/data/cms";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Pagina no encontrada");

export default async function NotFoundPage() {
  const document = await getCmsDocumentByKey("system-error-not-found");
  return <SystemStateScreen document={document} />;
}
