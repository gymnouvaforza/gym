import type { Metadata } from "next";

import ContactSection from "@/components/marketing/ContactSection";
import FloatingWhatsAppButton from "@/components/marketing/FloatingWhatsAppButton";
import HeroSection from "@/components/marketing/HeroSection";
import JsonLdScript from "@/components/marketing/JsonLdScript";
import ProductsSection from "@/components/marketing/ProductsSection";
import ScheduleSection from "@/components/marketing/ScheduleSection";
import TeamSection from "@/components/marketing/TeamSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import TrainingZonesSection from "@/components/marketing/TrainingZonesSection";
import ValueSection from "@/components/marketing/ValueSection";
import MembershipPlansCatalog from "@/components/public/MembershipPlansCatalog";
import { listMembershipPlans } from "@/lib/data/memberships";
import { getMarketingData } from "@/lib/data/site";
import {
  buildGymJsonLd,
  buildMarketingMetadata,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingData();

  return buildMarketingMetadata(settings, {
    description:
      "Gimnasio de fuerza en Chiclayo con horarios amplios, acompanamiento cercano y una propuesta seria para ganar masa muscular, mejorar salud y entrenar con metodo.",
    path: "/",
    title: "Gimnasio en Chiclayo para fuerza y progreso real",
  });
}

export default async function PublicHomePage() {
  const [{ settings, scheduleRows, teamMembers, testimonials }, membershipPlans] = await Promise.all([
    getMarketingData(),
    listMembershipPlans({ activeOnly: true }),
  ]);

  return (
    <>
      <JsonLdScript data={buildOrganizationJsonLd(settings)} />
      <JsonLdScript data={buildWebsiteJsonLd(settings)} />
      <JsonLdScript data={buildGymJsonLd(settings, scheduleRows)} />

      <div className="bg-[#151518]">
        <HeroSection settings={settings} />
        <FloatingWhatsAppButton settings={settings} />
        <ValueSection />
        <section id="planes" className="section-anchor bg-[#111111] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <MembershipPlansCatalog
              membershipPlans={membershipPlans}
              whatsappUrl={settings.whatsapp_url}
            />
          </div>
        </section>
        <ScheduleSection rows={scheduleRows} />
        <TeamSection members={teamMembers} />
        <ProductsSection />
        <TestimonialsSection testimonials={testimonials} />
        <TrainingZonesSection />
        <ContactSection settings={settings} />
      </div>
    </>
  );
}
