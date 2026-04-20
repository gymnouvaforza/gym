const MEMBER_REGISTRATION_COMPLETE_PATH = "/registro/completado";
const MEMBER_REGISTRATION_CONFIRMED_QUERY = "confirmed=1";
const MEMBER_PASSWORD_UPDATE_PATH = "/actualizar-contrasena";
const MEMBER_PASSWORD_RECOVERY_COMPLETE_PATH = "/acceso?confirmed=1";

export const MEMBER_REGISTRATION_CONFIRMED_PATH = `${MEMBER_REGISTRATION_COMPLETE_PATH}?${MEMBER_REGISTRATION_CONFIRMED_QUERY}`;
export const MEMBER_REGISTRATION_CONFIRM_ERROR = "confirm-link-invalid";

interface MemberRegistrationUrlOptions {
  confirmed?: boolean;
  email?: string | null;
  error?: string | null;
  pending?: boolean;
  resent?: boolean;
}

export function buildMemberRegistrationCompleteUrl({
  confirmed = false,
  email,
  error,
  pending = false,
  resent = false,
}: Readonly<MemberRegistrationUrlOptions>) {
  const url = new URL(MEMBER_REGISTRATION_COMPLETE_PATH, "https://nuovaforzagym.com");

  if (confirmed) {
    url.searchParams.set("confirmed", "1");
  }

  if (pending) {
    url.searchParams.set("pending", "1");
  }

  if (resent) {
    url.searchParams.set("resent", "1");
  }

  if (email) {
    url.searchParams.set("email", email);
  }

  if (error) {
    url.searchParams.set("error", error);
  }

  return `${url.pathname}${url.search}`;
}

export function buildMemberConfirmRedirectUrl(origin: string) {
  const url = new URL("/auth/confirm", origin);
  url.searchParams.set("next", MEMBER_REGISTRATION_CONFIRMED_PATH);
  return url.toString();
}

export function buildMemberPasswordUpdateRedirectUrl(origin: string) {
  const url = new URL(MEMBER_PASSWORD_UPDATE_PATH, origin);
  url.searchParams.set("next", MEMBER_PASSWORD_RECOVERY_COMPLETE_PATH);
  return url.toString();
}

export function sanitizeMemberRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return MEMBER_REGISTRATION_CONFIRMED_PATH;
  }

  try {
    const parsed = new URL(next, "https://nuovaforzagym.com");

    if (parsed.origin !== "https://nuovaforzagym.com") {
      return MEMBER_REGISTRATION_CONFIRMED_PATH;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return MEMBER_REGISTRATION_CONFIRMED_PATH;
  }
}
