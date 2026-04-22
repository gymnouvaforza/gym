import type { DBCmsDocument } from "@/lib/supabase/database.types";
import type { CmsDocumentValues } from "@/lib/validators/cms-document";

export function toCmsFormValues(document: DBCmsDocument): CmsDocumentValues {
  return {
    key: document.key as CmsDocumentValues["key"],
    kind: document.kind as CmsDocumentValues["kind"],
    slug: document.slug,
    title: document.title,
    summary: document.summary,
    body_markdown: document.body_markdown,
    cta_label: document.cta_label ?? "",
    cta_href: document.cta_href ?? "",
    seo_title: document.seo_title,
    seo_description: document.seo_description,
    is_published: document.is_published,
  };
}
