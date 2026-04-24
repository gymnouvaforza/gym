import type { MarketingTeamMember, MarketingPlan, MarketingScheduleRow } from "@/lib/data/marketing-content";
import type { MarketingTeamValues, MarketingPlansValues, MarketingScheduleValues } from "@/lib/validators/marketing";
import type { TrainingZone } from "@/data/training-zones";
import type { TrainingZonesValues } from "@/lib/validators/training-zone";

// Team Members
export function toMarketingTeamFormValues(members: MarketingTeamMember[]): MarketingTeamValues {
  return {
    teamMembers: members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      bio: member.bio,
      image_url: member.image_url ?? "",
      is_active: member.is_active,
      order: member.order,
    })),
  };
}

export function createEmptyTeamMember(order: number) {
  return {
    id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    name: "",
    role: "",
    bio: "",
    image_url: "",
    is_active: true,
    order,
  };
}

// Plans
export function toMarketingPlansFormValues(plans: MarketingPlan[]): MarketingPlansValues {
  return {
    plans: plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      description: plan.description ?? "",
      price_label: plan.price_label,
      billing_label: plan.billing_label,
      badge: plan.badge ?? "",
      is_featured: plan.is_featured,
      is_active: plan.is_active,
      order: plan.order,
      features: plan.features.map((feature) => ({
        label: feature.label,
        included: feature.included,
      })),
    })),
  };
}

export function createEmptyPlan(order: number) {
  return {
    id: `plan-${Math.random().toString(36).substring(7)}`,
    title: "",
    description: "",
    price_label: "",
    billing_label: "",
    badge: "",
    is_featured: false,
    is_active: true,
    order,
    features: [{ label: "Acceso ilimitado", included: true }],
  };
}

// Schedule
export function toMarketingScheduleFormValues(rows: MarketingScheduleRow[]): MarketingScheduleValues {
  return {
    scheduleRows: rows.map((row) => ({
      id: row.id,
      label: row.label,
      description: row.description ?? "",
      opens_at: row.opens_at,
      closes_at: row.closes_at,
      is_active: row.is_active,
      order: row.order,
    })),
  };
}

export function createEmptyScheduleRow(order: number) {
  return {
    id: `row-${Math.random().toString(36).substring(7)}`,
    label: "",
    description: "",
    opens_at: "06:00",
    closes_at: "22:00",
    is_active: true,
    order,
  };
}

// Training Zones
export function toTrainingZonesFormValues(zones: TrainingZone[]): TrainingZonesValues {
  return {
    trainingZones: zones.map((zone) => ({
      id: zone.id,
      slug: zone.slug,
      title: zone.title,
      short_label: zone.short_label,
      subtitle: zone.subtitle ?? "",
      description: zone.description,
      icon: zone.icon,
      video_url: zone.video_url,
      poster_url: zone.poster_url ?? "",
      cta_label: zone.cta_label ?? "",
      cta_href: zone.cta_href ?? "",
      order_index: zone.order_index,
      active: zone.active,
    })),
  };
}
