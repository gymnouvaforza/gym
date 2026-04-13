"use client";

import dynamic from "next/dynamic";

import TrainingZonesSectionFallback from "@/components/marketing/TrainingZonesSectionFallback";

const TrainingZonesCarousel = dynamic(
  () => import("@/components/marketing/TrainingZonesCarousel"),
  {
    ssr: false,
    loading: () => <TrainingZonesSectionFallback />,
  },
);

export default function TrainingZonesSection() {
  return <TrainingZonesCarousel />;
}
