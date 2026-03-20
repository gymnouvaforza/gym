import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock3, Database, MessageSquareMore, Package, Store } from "lucide-react";

import type { Product } from "@/data/types";
import type { CommerceSource } from "@/lib/commerce/types";
import type { Lead, LeadStatus } from "@/lib/supabase/database.types";

export interface LeadStatusMeta {
  label: string;
  tone: "default" | "muted" | "success" | "warning";
}

type TopbarStatus = "active" | "expired" | "inactive";

export function countLeadsByStatus(leads: Lead[]) {
  return leads.reduce(
    (summary, lead) => {
      summary[lead.status] += 1;
      return summary;
    },
    { new: 0, contacted: 0, closed: 0 } as Record<LeadStatus, number>,
  );
}

export function getLeadStatusMeta(status: LeadStatus): LeadStatusMeta {
  switch (status) {
    case "contacted":
      return { label: "Contactado", tone: "muted" };
    case "closed":
      return { label: "Cerrado", tone: "success" };
    case "new":
    default:
      return { label: "Nuevo", tone: "warning" };
  }
}

export function getTopbarStatusMeta(status: TopbarStatus): LeadStatusMeta {
  switch (status) {
    case "active":
      return { label: "Activo", tone: "success" };
    case "expired":
      return { label: "Caducado", tone: "warning" };
    case "inactive":
    default:
      return { label: "Inactivo", tone: "muted" };
  }
}

export interface DashboardMetricItem {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "default" | "muted" | "success" | "warning";
}

export interface CommerceSourceMeta {
  label: string;
  tone: "default" | "muted" | "success" | "warning";
  hint: string;
}

interface CommerceSourceStateOptions {
  warning?: string | null;
}

export function buildDashboardMetrics(leads: Lead[], unreadLeads: number): DashboardMetricItem[] {
  const leadSummary = countLeadsByStatus(leads);
  const contactedRatio = leads.length
    ? `${Math.round(((leadSummary.contacted + leadSummary.closed) / leads.length) * 100)}%`
    : "0%";

  return [
    {
      label: "Leads pendientes",
      value: String(unreadLeads),
      hint: unreadLeads ? "Contactos nuevos esperando seguimiento." : "Bandeja al dia por ahora.",
      icon: Clock3,
      tone: unreadLeads ? "warning" : "success",
    },
    {
      label: "Total captado",
      value: String(leads.length),
      hint: `${leadSummary.closed} cerrados y ${leadSummary.contacted} ya contactados.`,
      icon: MessageSquareMore,
    },
    {
      label: "Seguimiento activo",
      value: contactedRatio,
      hint: "Porcentaje de leads que ya salieron del estado inicial.",
      icon: CheckCircle2,
      tone: leads.length ? "default" : "muted",
    },
  ];
}

export function getCommerceSourceMeta(
  source: CommerceSource,
  options: CommerceSourceStateOptions = {},
): CommerceSourceMeta {
  if (options.warning) {
    return {
      label: source === "medusa" ? "Medusa bloqueada" : "Fuente bloqueada",
      tone: "warning",
      hint: options.warning,
    };
  }

  return {
    label: source === "medusa" ? "Medusa activa" : "Medusa activa",
    tone: "success",
    hint:
      "El dashboard propio opera la tienda sobre Medusa y persiste los enlaces operativos en Supabase.",
  };
}

export function buildCommerceMetrics(
  products: Product[],
  source: CommerceSource,
  options: CommerceSourceStateOptions = {},
): DashboardMetricItem[] {
  const featuredCount = products.filter((product) => product.featured).length;
  const pickupCount = products.filter((product) => product.pickup_only).length;
  const reviewCount = products.filter(
    (product) =>
      product.stock_status === "coming_soon" || product.stock_status === "out_of_stock",
  ).length;
  const sourceMeta = getCommerceSourceMeta(source, options);
  const isBlocked = Boolean(options.warning);

  return [
    {
      label: "Catalogo visible",
      value: String(products.length),
      hint: isBlocked
        ? "No hay lectura operativa valida del catalogo mientras la integracion siga bloqueada."
        : `${featuredCount} destacados y ${pickupCount} orientados a recogida local.`,
      icon: Package,
      tone: isBlocked ? "warning" : products.length > 0 ? "default" : "muted",
    },
    {
      label: "Fuente commerce",
      value: sourceMeta.label,
      hint: sourceMeta.hint,
      icon: Database,
      tone: sourceMeta.tone,
    },
    {
      label: "Revision operativa",
      value: isBlocked ? "Bloqueada" : String(reviewCount),
      hint: isBlocked
        ? "Resuelve la configuracion o disponibilidad de Medusa antes de operar cambios del catalogo."
        : reviewCount
          ? "Productos sin stock o en proxima reposicion que conviene revisar."
          : "Catalogo estable por ahora, sin incidencias de disponibilidad.",
      icon: Store,
      tone: isBlocked ? "warning" : reviewCount ? "warning" : "success",
    },
  ];
}
