import { NextResponse } from "next/server";

import { sendFirebasePasswordResetEmail } from "@/lib/firebase/email-actions";
import { sanitizeMemberRedirectPath } from "@/lib/member-auth-flow";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    next?: string;
  };

  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Necesitamos un email valido." }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    await sendFirebasePasswordResetEmail({
      absoluteOrigin: origin,
      email,
      nextPath: sanitizeMemberRedirectPath(body.next) || "/acceso?confirmed=1",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar el enlace de recuperacion." },
      { status: 400 },
    );
  }
}
