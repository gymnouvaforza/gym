import TrainingZonesCarousel from "@/components/marketing/TrainingZonesCarousel";
import type { TrainingZone } from "@/data/training-zones";

interface TrainingZonesSectionProps {
  zones: TrainingZone[];
}

export default function TrainingZonesSection({ zones }: Readonly<TrainingZonesSectionProps>) {
  return <TrainingZonesCarousel zones={zones} />;
}
