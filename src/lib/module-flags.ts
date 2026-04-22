import type { Database } from "@/lib/supabase/database.types";

export const SYSTEM_MODULE_NAMES = [
  "tienda",
  "rutinas",
  "mobile",
  "leads",
  "marketing",
  "cms",
] as const;

export type SystemModuleName = (typeof SYSTEM_MODULE_NAMES)[number];

export type SystemModuleStateMap = Record<SystemModuleName, boolean>;

type DatabaseSystemModuleRow = Pick<
  Database["public"]["Tables"]["system_modules"]["Row"],
  "description" | "id" | "is_enabled" | "name" | "updated_at"
>;

export type SystemModuleDefinition = {
  name: SystemModuleName;
  label: string;
  description: string;
  disabledImpact: string;
};

export type SystemModuleRow = DatabaseSystemModuleRow & {
  name: SystemModuleName;
  label: string;
  disabledImpact: string;
};

export type ModuleActionResponse = {
  success: boolean;
  error?: string;
};

export const SYSTEM_MODULE_DEFINITIONS = [
  {
    name: "tienda",
    label: "Tienda",
    description: "Storefront pickup, carrito y dashboard commerce.",
    disabledImpact: "Desactiva /tienda, /carrito y todo CRUD commerce del dashboard.",
  },
  {
    name: "rutinas",
    label: "Rutinas",
    description: "Editor, listado y gestion operativa de rutinas.",
    disabledImpact: "Oculta editor y rutas /dashboard/rutinas para staff no-superadmin.",
  },
  {
    name: "mobile",
    label: "App movil",
    description: "Controla shell mobile, APIs /api/mobile y dashboard mobile.",
    disabledImpact: "Bloquea /dashboard/mobile y la app mobile para cualquier usuario no-superadmin.",
  },
  {
    name: "leads",
    label: "Leads",
    description: "Embudo comercial, bandeja y widgets de captacion.",
    disabledImpact: "Oculta /dashboard/leads y quita atajos comerciales del command center.",
  },
  {
    name: "marketing",
    label: "Marketing",
    description: "Modulo operativo de campañas y planes en dashboard.",
    disabledImpact: "Bloquea /dashboard/marketing y retira su acceso del sidebar.",
  },
  {
    name: "cms",
    label: "CMS",
    description: "Textos legales y documentos ligeros de sistema.",
    disabledImpact: "Oculta /dashboard/cms y deshabilita gestion editorial interna.",
  },
] as const satisfies readonly SystemModuleDefinition[];

export const SYSTEM_MODULE_DEFINITION_MAP = Object.fromEntries(
  SYSTEM_MODULE_DEFINITIONS.map((module) => [module.name, module]),
) as Record<SystemModuleName, SystemModuleDefinition>;

export const DEFAULT_SYSTEM_MODULE_STATE_MAP = Object.fromEntries(
  SYSTEM_MODULE_NAMES.map((name) => [name, true]),
) as SystemModuleStateMap;

export function createDefaultModuleStateMap(): SystemModuleStateMap {
  return { ...DEFAULT_SYSTEM_MODULE_STATE_MAP };
}

export function isKnownSystemModuleName(value: string): value is SystemModuleName {
  return SYSTEM_MODULE_NAMES.includes(value as SystemModuleName);
}
