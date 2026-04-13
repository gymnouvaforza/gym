import type { Metadata } from "next";

import JsonLdScript from "@/components/marketing/JsonLdScript";
import ScheduleSection from "@/components/marketing/ScheduleSection";
import { getMarketingData } from "@/lib/data/site";
import { buildBreadcrumbJsonLd, buildMarketingMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingData();

  return buildMarketingMetadata(settings, {
    description:
      "Consulta los horarios de atencion y apertura de Nuova Forza en Chiclayo antes de planificar tu entrenamiento.",
    path: "/horarios",
    title: "Horarios del gimnasio en Chiclayo",
  });
}

export default async function SchedulePage() {
  const { scheduleRows } = await getMarketingData();

  return (
    <>
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Horarios", path: "/horarios" },
        ])}
      />
      <div className="bg-[#f5f5f0]">
        <ScheduleSection rows={scheduleRows} />
      </div>
    </>
  );
}
