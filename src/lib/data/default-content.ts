import type { Lead, SiteSettings } from "@/lib/supabase/database.types";

const fallbackContactPhone = process.env.NEXT_PUBLIC_GYM_CONTACT_PHONE ?? "+34 654 19 47 88";
const fallbackWhatsAppUrl =
  process.env.NEXT_PUBLIC_GYM_WHATSAPP_URL ?? "https://wa.me/34654194788";

export const defaultSiteSettings: SiteSettings = {
  id: 1,
  site_name: "Gimnasio Nuova Forza",
  site_tagline: "33 años enseñándote a entrenar.",
  hero_badge: "Entrenamiento premium local",
  hero_title: "El poder de tu progreso comienza aqui",
  hero_description:
    "El gimnasio de fuerza de referencia con asesoria personalizada y un ambiente disenado para resultados reales.",
  hero_primary_cta: "Reserva tu prueba",
  hero_secondary_cta: "Ver planes",
  hero_video_url: "/video/video.mp4",
  topbar_enabled: true,
  topbar_variant: "promotion",
  topbar_text: "Matricula gratis por tiempo limitado para nuevos socios.",
  topbar_cta_label: "Reserva tu prueba",
  topbar_cta_url: "#contacto",
  topbar_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  hero_highlight_one: "Planes claros para empezar, progresar y sostener resultados.",
  hero_highlight_two: "Entrenadores que corrigen, acompanan y hacen seguimiento real.",
  hero_highlight_three: "Nuova Forza es el espacio local con horarios amplios y la mejor asesoria presencial de la zona.",
  contact_email: "soporte@nuovaforzagym.com",
  notification_email: "soporte@nuovaforzagym.com",
  transactional_from_email: "soporte@nuovaforzagym.com",
  contact_phone: fallbackContactPhone,
  whatsapp_url: fallbackWhatsAppUrl,
  address: "San José #371, segundo piso, Chiclayo",
  opening_hours: "Lunes a viernes 6am-10pm. Sabados 6am-12pm. Domingos cerrado.",
  seo_title: "Nuova Forza | Gimnasio premium de fuerza y progreso real",
  seo_description:
    "Web comercial de Nuova Forza: planes claros, horarios amplios, asesoria cercana y una experiencia premium para entrenar con seriedad.",
  seo_keywords: [
    "gimnasio premium",
    "fuerza",
    "planes de gimnasio",
    "entrenamiento personalizado",
    "Nuova Forza",
  ],
  seo_og_image_url: null,
  seo_canonical_url: "https://nuovaforzagym.com",
  footer_text: "Nuova Forza es un gimnasio local orientado a fuerza, progreso real y una experiencia seria y cercana.",
  updated_at: new Date().toISOString(),
};

export const plannedModules = [
  "Sitio publico",
  "Planes",
  "Horarios",
  "Productos",
  "Reservas",
  "Leads",
  "Miembros",
  "Rutinas",
  "Pedidos pickup",
  "Ajustes y CMS",
];

export const defaultLeads: Lead[] = [
  {
    id: "lead-demo-1",
    channel: null,
    contacted_at: null,
    name: "Lucia Romero",
    email: "lucia@example.com",
    phone: "+51 999 112 233",
    message: "Quiero reservar una prueba y saber que plan me conviene si busco bajar grasa.",
    source: "website",
    status: "new",
    metadata: {
      demo: true,
      interest: "prueba",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    next_step: "Responder hoy con los planes iniciales y ofrecer una prueba guiada.",
    outcome: null,
  },
  {
    id: "lead-demo-2",
    channel: "WhatsApp",
    contacted_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    name: "Diego Flores",
    email: "diego@example.com",
    phone: "+51 988 445 566",
    message: "Me interesa el plan Progreso para entrenar fuerza antes de ir a trabajar.",
    source: "website",
    status: "contacted",
    metadata: {
      demo: true,
      interest: "plan progreso",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    next_step: "Enviar comparativa de horarios y confirmar visita esta semana.",
    outcome: "Pidio precios y horarios antes de agendar visita.",
  },
  {
    id: "lead-demo-3",
    channel: "Visita guiada",
    contacted_at: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
    name: "Paola Rivas",
    email: "paola@example.com",
    phone: null,
    message: "Ya hice la visita guiada y quiero volver para cerrar mi inscripcion este fin de semana.",
    source: "website",
    status: "closed",
    metadata: {
      demo: true,
      interest: "inscripcion",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    next_step: null,
    outcome: "Inscripcion cerrada tras visita y seguimiento final.",
  },
];
