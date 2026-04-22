import { NextResponse } from "next/server";

import {
  DASHBOARD_ROLE_OVERRIDE_COOKIE,
  LOCAL_ADMIN_COOKIE,
} from "@/lib/auth";
import { hasLocalAdminEnv } from "@/lib/env";

const ALLOWED_ROLES = new Set(["superadmin", "admin", "trainer"]);

function isDevRoleOverrideEnabled() {
  return process.env.NODE_ENV !== "production" && hasLocalAdminEnv();
}

export async function POST(request: Request) {
  if (!isDevRoleOverrideEnabled()) {
    return NextResponse.json({ error: "Override de rol no disponible." }, { status: 404 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  if (!cookieHeader.includes(`${LOCAL_ADMIN_COOKIE}=`)) {
    return NextResponse.json({ error: "Sesion local requerida." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as { role?: string };
  const role = typeof payload.role === "string" ? payload.role.trim() : "";

  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: "Rol invalido." }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(DASHBOARD_ROLE_OVERRIDE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(DASHBOARD_ROLE_OVERRIDE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
