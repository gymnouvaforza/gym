import { NextResponse } from "next/server";

import {
  FIREBASE_SESSION_COOKIE,
  verifyFirebaseSessionToken,
} from "@/lib/firebase/server";
import { hasFirebaseAdminEnv } from "@/lib/env";

function buildResponse() {
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const response = buildResponse();

  if (!hasFirebaseAdminEnv()) {
    response.cookies.set(FIREBASE_SESSION_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  const body = (await request.json().catch(() => ({}))) as { idToken?: string | null };
  const idToken = typeof body.idToken === "string" ? body.idToken.trim() : "";

  if (!idToken) {
    response.cookies.set(FIREBASE_SESSION_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  try {
    await verifyFirebaseSessionToken(idToken);
  } catch {
    return NextResponse.json({ error: "Token de sesion invalido." }, { status: 401 });
  }

  response.cookies.set(FIREBASE_SESSION_COOKIE, idToken, {
    httpOnly: true,
    maxAge: 60 * 60,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function DELETE() {
  const response = buildResponse();
  response.cookies.set(FIREBASE_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
