import type { AuthUser as User } from "@/lib/auth-user";
import { NextResponse } from "next/server";

import { getCurrentFirebaseUserFromCookies, getFirebaseUserFromIdToken } from "@/lib/firebase/server";
import {
  DASHBOARD_ACCESS_ROLES,
  hasAnyUserRoleForAccessToken,
  hasAnyUserRoleForServerSession,
} from "@/lib/user-roles";
import type { MobileRole } from "@mobile-contracts";

function parseBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

export async function resolveMobileRequestUser(request: Request): Promise<User | null> {
  const accessToken = parseBearerToken(request);

  if (accessToken) {
    return getFirebaseUserFromIdToken(accessToken);
  }

  return getCurrentFirebaseUserFromCookies();
}

async function resolveMobileBaseRole(request: Request, user: User): Promise<MobileRole> {
  const accessToken = parseBearerToken(request);

  if (accessToken) {
    return (await hasAnyUserRoleForAccessToken(user.id, accessToken, DASHBOARD_ACCESS_ROLES))
      ? "staff"
      : "member";
  }

  return (await hasAnyUserRoleForServerSession(user.id, DASHBOARD_ACCESS_ROLES))
    ? "staff"
    : "member";
}

function unauthorized(message = "Necesitas iniciar sesión para usar la app mobile.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message = "No tienes permisos para esta acción.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireMobileSession(request: Request) {
  const user = await resolveMobileRequestUser(request);

  if (!user?.email) {
    return {
      user: null,
      role: null,
      response: unauthorized(),
    };
  }

  const role = await resolveMobileBaseRole(request, user);

  return {
    user,
    role,
    response: null,
  };
}

export async function requireMobileStaffSession(request: Request) {
  const session = await requireMobileSession(request);

  if (session.response) {
    return session;
  }

  if (session.role !== "staff") {
    return {
      ...session,
      response: forbidden("Solo el staff puede acceder a esta superficie mobile."),
    };
  }

  return session;
}
