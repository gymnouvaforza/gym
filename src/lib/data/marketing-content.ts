export interface MarketingPlanFeature {
  label: string;
  included: boolean;
}

export interface MarketingPlan {
  id: string;
  site_settings_id: number;
  title: string;
  description: string | null;
  price_label: string;
  billing_label: string;
  badge: string | null;
  features: MarketingPlanFeature[];
  is_featured: boolean;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketingScheduleRow {
  id: string;
  site_settings_id: number;
  label: string;
  description: string | null;
  opens_at: string;
  closes_at: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MarketingTestimonialModerationStatus = "pending" | "approved" | "rejected";

export interface MarketingTestimonial {
  id: string;
  site_settings_id: number;
  member_profile_id: string;
  supabase_user_id: string;
  quote: string;
  rating: number;
  author_name: string;
  author_detail: string;
  author_initials: string;
  moderation_status: MarketingTestimonialModerationStatus;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

const nowIso = new Date(0).toISOString();

export const defaultMarketingPlans: MarketingPlan[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    site_settings_id: 1,
    title: "Plan Mensual",
    description: "Ideal para empezar tu camino con asesoría constante.",
    price_label: "S/ 90",
    billing_label: "/mes",
    badge: null,
    features: [
      { label: "Acceso total a máquinas de fuerza", included: true },
      { label: "Evaluación física inicial", included: true },
      { label: "Seguimiento por entrenadores", included: true },
      { label: "Plan nutricional avanzado", included: false },
    ],
    is_featured: false,
    order: 0,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    site_settings_id: 1,
    title: "Plan Trimestral",
    description: "Nuestro plan más popular para ver cambios reales.",
    price_label: "S/ 240",
    billing_label: "/3 meses",
    badge: "Más Popular",
    features: [
      { label: "Todo lo del plan Mensual", included: true },
      { label: "Plan de entrenamiento personalizado", included: true },
      { label: "10% dto en suplementos", included: true },
      { label: "1 Invitado gratis al mes", included: true },
    ],
    is_featured: true,
    order: 1,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    site_settings_id: 1,
    title: "Plan Anual",
    description: "Compromiso total con tu mejor versión. Máximo ahorro.",
    price_label: "S/ 850",
    billing_label: "/año",
    badge: "Mejor Valor",
    features: [
      { label: "Todo lo del plan Trimestral", included: true },
      { label: "Evaluación física trimestral", included: true },
      { label: "Polo oficial del gym gratis", included: true },
      { label: "Congelamiento de membresía", included: true },
    ],
    is_featured: false,
    order: 2,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
];

export const defaultMarketingScheduleRows: MarketingScheduleRow[] = [
  {
    id: "44444444-4444-4444-4444-444444444444",
    site_settings_id: 1,
    label: "Lunes - Viernes",
    description: null,
    opens_at: "06:00 AM",
    closes_at: "10:00 PM",
    order: 0,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    site_settings_id: 1,
    label: "Sabados",
    description: "Medio dia",
    opens_at: "06:00 AM",
    closes_at: "12:00 PM",
    order: 1,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    site_settings_id: 1,
    label: "Domingos",
    description: "Cerrado",
    opens_at: "-",
    closes_at: "-",
    order: 2,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  },
];

export const defaultMarketingTestimonials: MarketingTestimonial[] = [];
