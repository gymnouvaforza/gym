import { serializeJsonLd } from "@/lib/seo";

export default function JsonLdScript({
  data,
}: Readonly<{
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
