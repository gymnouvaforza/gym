import type { Metadata } from "next";

import ContactSection from "@/components/marketing/ContactSection";
import FloatingWhatsAppButton from "@/components/marketing/FloatingWhatsAppButton";
import HeroSection from "@/components/marketing/HeroSection";
import ProductsSection from "@/components/marketing/ProductsSection";
import ScheduleSection from "@/components/marketing/ScheduleSection";
import TeamSection from "@/components/marketing/TeamSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import TrainingZonesSection from "@/components/marketing/TrainingZonesSection";
import ValueSection from "@/components/marketing/ValueSection";
import MembershipPlansCatalog from "@/components/public/MembershipPlansCatalog";
import { getCurrentMemberUser } from "@/lib/auth";
import { listMembershipPlans } from "@/lib/data/memberships";
import { getMarketingData } from "@/lib/data/site";
import { buildMarketingMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getMarketingData();
  return buildMarketingMetadata(settings);
}

export default async function PublicHomePage() {
  const [{ settings, scheduleRows, teamMembers, testimonials }, membershipPlans, user] = await Promise.all([
    getMarketingData(),
    listMembershipPlans({ activeOnly: true }),
    getCurrentMemberUser(),
  ]);

  return (
    <div className="bg-[#151518]">
      <HeroSection settings={settings} />
      <FloatingWhatsAppButton settings={settings} />
      <ValueSection />
      <section id="planes" className="section-anchor bg-[#111111] py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          <MembershipPlansCatalog
            membershipPlans={membershipPlans}
            user={user}
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
  );
}
