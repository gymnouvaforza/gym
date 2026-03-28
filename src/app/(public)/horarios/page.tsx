import type { Metadata } from "next";

import ScheduleSection from "@/components/marketing/ScheduleSection";
import { getMarketingData } from "@/lib/data/site";
import { buildMarketingMetadata, resolveCanonicalUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingData();
  const metadata = buildMarketingMetadata(settings);

  return {
    ...metadata,
    title: `Horarios | ${settings.site_name}`,
    alternates: {
      canonical: resolveCanonicalUrl("/horarios"),
    },
  };
}

export default async function SchedulePage() {
  const { scheduleRows } = await getMarketingData();

  return (
    <div className="bg-[#f5f5f0]">
      <ScheduleSection rows={scheduleRows} />
    </div>
  );
}
