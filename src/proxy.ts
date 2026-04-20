import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { FIREBASE_SESSION_COOKIE, verifyFirebaseSessionToken } from "@/lib/firebase/server";

const ADMIN_ROUTES = ["/dashboard"];
const LOGIN_PATH = "/login";

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  let user = null;
  const firebaseSession = request.cookies.get(FIREBASE_SESSION_COOKIE)?.value;

  if (firebaseSession) {
    try {
      user = await verifyFirebaseSessionToken(firebaseSession);
    } catch {
      response.cookies.set(FIREBASE_SESSION_COOKIE, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  if (isAdminRoute(request.nextUrl.pathname) && !user) {
    const localAdminCookie = request.cookies.get("gym_admin_session")?.value;

    if (!localAdminCookie) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      loginUrl.searchParams.set("error", "admin-only");
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
