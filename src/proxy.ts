import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getServerSupabaseEnv, hasSupabaseServiceRole, hasLocalAdminEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";
import { verifyFirebaseSessionToken } from "@/lib/firebase/server";
import { SUPERADMIN_ROLE } from "@/lib/user-roles";

const ADMIN_ROUTES = ["/dashboard"];
const LOGIN_PATH = "/login";
const GATED_404_PATH = "/_gated-404";
const FIREBASE_SESSION_COOKIE = "gym_firebase_session";
const LOCAL_ADMIN_COOKIE = "gym_admin_session";

const MODULE_ROUTE_PREFIXES = {
  tienda: ["/dashboard/tienda", "/tienda", "/carrito"],
  rutinas: ["/dashboard/rutinas"],
  mobile: ["/dashboard/mobile"],
  leads: ["/dashboard/leads"],
  marketing: ["/dashboard/marketing"],
  cms: ["/dashboard/cms"],
} as const;

type ModuleName = keyof typeof MODULE_ROUTE_PREFIXES;

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function getModuleNameForPathname(pathname: string): ModuleName | null {
  for (const [name, prefixes] of Object.entries(MODULE_ROUTE_PREFIXES) as Array<
    [ModuleName, readonly string[]]
  >) {
    if (prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return name;
    }
  }

  return null;
}

async function verifyFirebaseUserId(idToken: string | null) {
  if (!idToken) {
    return null;
  }

  try {
    const decodedToken = await verifyFirebaseSessionToken(idToken);
    return decodedToken.uid;
  } catch {
    return null;
  }
}

async function getModuleState(name: ModuleName) {
  if (!hasSupabaseServiceRole()) {
    return true;
  }

  const { url, serviceRoleKey } = getServerSupabaseEnv();

  if (!serviceRoleKey) {
    return true;
  }

  const client = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client
    .from("system_modules")
    .select("is_enabled")
    .eq("name", name)
    .maybeSingle();

  if (error) {
    const normalized = error.message.toLowerCase();
    if (
      normalized.includes("system_modules") &&
      (normalized.includes("does not exist") ||
        normalized.includes("relation") ||
        normalized.includes("schema cache"))
    ) {
      return true;
    }

    throw new Error(error.message);
  }

  return data?.is_enabled ?? true;
}

async function isSuperadminRequest(userId: string | null) {
  if (!userId || !hasSupabaseServiceRole()) {
    return false;
  }

  const { url, serviceRoleKey } = getServerSupabaseEnv();

  if (!serviceRoleKey) {
    return false;
  }

  const client = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", SUPERADMIN_ROLE)
    .maybeSingle();

  if (error) {
    const normalized = error.message.toLowerCase();
    if (
      normalized.includes("user_roles") &&
      (normalized.includes("does not exist") ||
        normalized.includes("relation") ||
        normalized.includes("schema cache"))
    ) {
      return false;
    }

    throw new Error(error.message);
  }

  return data?.role === SUPERADMIN_ROLE;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const firebaseSession = request.cookies.get(FIREBASE_SESSION_COOKIE)?.value;
  const firebaseUserId = await verifyFirebaseUserId(firebaseSession ?? null);
  const hasFirebaseSession = Boolean(firebaseUserId);

  if (isAdminRoute(request.nextUrl.pathname)) {
    if (!hasFirebaseSession) {
      const localAdminCookie = request.cookies.get(LOCAL_ADMIN_COOKIE)?.value;

      // Solo permitimos localAdmin si no estamos en produccion
      const isLocalEnabled = process.env.NODE_ENV !== "production" && hasLocalAdminEnv();

      if (!isLocalEnabled || !localAdminCookie) {
        const loginUrl = new URL(LOGIN_PATH, request.url);
        loginUrl.searchParams.set("next", request.nextUrl.pathname);
        loginUrl.searchParams.set("error", "admin-only");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const moduleName = getModuleNameForPathname(request.nextUrl.pathname);

  if (!moduleName) {
    return response;
  }

  const [isEnabled, isSuperadmin] = await Promise.all([
    getModuleState(moduleName),
    isSuperadminRequest(firebaseUserId),
  ]);

  if (!isEnabled && !isSuperadmin) {
    return NextResponse.rewrite(new URL(GATED_404_PATH, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/tienda/:path*", "/tienda", "/carrito/:path*", "/carrito"],
};
