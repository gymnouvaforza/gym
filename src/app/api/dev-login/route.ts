import { NextResponse } from "next/server";

import { getLocalAdminEnv, hasLocalAdminEnv } from "@/lib/env";
import { LOCAL_ADMIN_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  if (!hasLocalAdminEnv()) {
    return NextResponse.json({ error: "Login local no disponible." }, { status: 404 });
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const identity =
    typeof payload?.identity === "string" ? payload.identity.trim() : "";
  const password =
    typeof payload?.password === "string" ? payload.password : "";

  const adminEnv = getLocalAdminEnv();

  if (!adminEnv || identity !== adminEnv.user || password !== adminEnv.password) {
    return NextResponse.json({ error: "Credenciales invalidas." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(LOCAL_ADMIN_COOKIE, adminEnv.user, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
