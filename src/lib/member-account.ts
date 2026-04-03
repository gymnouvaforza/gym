import { formatShortDate } from "@/lib/utils";

interface AuthProviderLike {
  email?: string | null;
  app_metadata?: {
    full_name?: unknown;
    provider?: unknown;
  } | null;
  user_metadata?: {
    full_name?: unknown;
  } | null;
  identities?: Array<{
    provider?: string | null;
  }> | null;
}

export interface MemberAccountQuickLink {
  href: string;
  label: string;
  description: string;
}

function normalizeProvider(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

export function formatMemberAccountDate(value: string | null | undefined) {
  if (!value) {
    return "Sin registro";
  }

  return formatShortDate(value);
}

export function getMemberAuthProviderLabel(user: AuthProviderLike) {
  const provider =
    normalizeProvider(user.app_metadata?.provider) ??
    normalizeProvider(user.identities?.[0]?.provider);

  switch (provider) {
    case "email":
    case "password":
      return "Email y contrasena";
    case "google":
      return "Google";
    case "phone":
      return "Telefono";
    default:
      return "Acceso basico";
  }
}

export function isPasswordAuthProvider(user: AuthProviderLike) {
  const provider =
    normalizeProvider(user.app_metadata?.provider) ??
    normalizeProvider(user.identities?.[0]?.provider);

  return provider === "email" || provider === "password" || provider === null;
}

function getDisplayNameFromEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  const localPart = normalized.split("@")[0] ?? "usuario";

  return localPart
    .split(/[._+\-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getMemberDisplayName(user: AuthProviderLike) {
  const appMetadataName =
    typeof user.app_metadata?.full_name === "string" ? user.app_metadata.full_name.trim() : "";
  const userMetadataName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";

  return appMetadataName || userMetadataName || getDisplayNameFromEmail(user.email);
}

export function getMemberAccountQuickLinks(input: {
  hasActiveCart: boolean;
  hasPickupHistory: boolean;
}): MemberAccountQuickLink[] {
  return [
    input.hasActiveCart
      ? {
          href: "/carrito",
          label: "Retomar carrito",
          description: "Continua tu compra pickup desde el punto donde la dejaste.",
        }
      : {
          href: "/tienda",
          label: "Ir a la tienda",
          description: "Explora productos y abre un nuevo carrito pickup cuando quieras.",
        },
    {
      href: "#pedidos-pickup",
      label: input.hasPickupHistory ? "Ver pedidos pickup" : "Seguir futuros pedidos",
      description: input.hasPickupHistory
        ? "Baja al resumen de pedidos pickup asociados a tu cuenta."
        : "Cuando cierres tu primera compra, aqui veras el seguimiento privado.",
    },
    {
      href: "/horarios",
      label: "Horarios del club",
      description: "Consulta cuando pasar por el club para recoger o entrenar.",
    },
  ];
}
