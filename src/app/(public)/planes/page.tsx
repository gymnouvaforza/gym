import type { Metadata } from "next";

import PlansSection from "@/components/marketing/PlansSection";
import { getMarketingData } from "@/lib/data/site";
import { buildMarketingMetadata, resolveCanonicalUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingData();
  const metadata = buildMarketingMetadata(settings);

  return {
    ...metadata,
    title: `Planes | ${settings.site_name}`,
    alternates: {
      canonical: resolveCanonicalUrl("/planes"),
    },
  };
}

export default async function PlansPage() {
  const { settings, plans } = await getMarketingData();

  return (
    <div className="bg-[#151518]">
      <PlansSection settings={settings} plans={plans} />
    </div>
  );
}
