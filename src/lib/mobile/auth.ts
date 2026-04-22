import type { AuthUser as User } from "@/lib/auth-user";
import { NextResponse } from "next/server";

import { isModuleEnabled } from "@/lib/data/modules";
import { getCurrentFirebaseUserFromCookies, getFirebaseUserFromIdToken } from "@/lib/firebase/server";
import {
  DASHBOARD_ADMIN_ROLE,
  MOBILE_STAFF_ROLES,
  SUPERADMIN_ROLE,
  TRAINER_ROLE,
  listUserRolesForAccessToken,
  listUserRolesForServerSession,
} from "@/lib/user-roles";
import type { MobileRole, MobileStaffAccessLevel } from "@mobile-contracts";

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

async function resolvePersistedMobileRoles(request: Request, user: User) {
  const accessToken = parseBearerToken(request);

  if (accessToken) {
    return await listUserRolesForAccessToken(user.id, accessToken);
  }

  return await listUserRolesForServerSession(user.id);
}

function resolveMobileStaffAccessLevel(
  roles: readonly string[],
): MobileStaffAccessLevel | null {
  if (roles.includes(SUPERADMIN_ROLE)) {
    return "superadmin";
  }

  if (roles.includes(DASHBOARD_ADMIN_ROLE)) {
    return "admin";
  }

  if (roles.includes(TRAINER_ROLE)) {
    return "trainer";
  }

  return null;
}

async function resolveMobileBaseRole(
  request: Request,
  user: User,
): Promise<{ role: MobileRole; staffAccessLevel: MobileStaffAccessLevel | null }> {
  const roles = await resolvePersistedMobileRoles(request, user);
  const staffAccessLevel = resolveMobileStaffAccessLevel(roles);
  const role = MOBILE_STAFF_ROLES.some((staffRole) => roles.includes(staffRole))
    ? "staff"
    : "member";

  return {
    role,
    staffAccessLevel,
  };
}

function unauthorized(message = "Necesitas iniciar sesion para usar la app mobile.") {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message = "No tienes permisos para esta accion.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

function mobileModuleUnavailable() {
  return NextResponse.json(
    { error: "La app mobile no esta disponible en este momento." },
    { status: 404 },
  );
}

export async function requireMobileSession(request: Request) {
  const user = await resolveMobileRequestUser(request);

  if (!user?.email) {
    return {
      user: null,
      role: null,
      staffAccessLevel: null,
      response: unauthorized(),
    };
  }

  const { role, staffAccessLevel } = await resolveMobileBaseRole(request, user);
  const mobileModuleActive = await isModuleEnabled("mobile");

  if (!mobileModuleActive && staffAccessLevel !== "superadmin") {
    return {
      user: null,
      role: null,
      staffAccessLevel,
      response: mobileModuleUnavailable(),
    };
  }

  return {
    user,
    role,
    staffAccessLevel,
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

export async function requireMobileSuperadminSession(request: Request) {
  const session = await requireMobileSession(request);

  if (session.response) {
    return session;
  }

  if (session.staffAccessLevel !== "superadmin") {
    return {
      ...session,
      response: forbidden("Solo superadmin puede acceder a esta superficie mobile."),
    };
  }

  return session;
}
