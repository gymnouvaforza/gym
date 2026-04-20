import { NextResponse } from "next/server";

import { sendFirebaseVerificationEmail } from "@/lib/firebase/email-actions";
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
    await sendFirebaseVerificationEmail({
      absoluteOrigin: origin,
      email,
      nextPath: sanitizeMemberRedirectPath(body.next) || "/registro/completado?confirmed=1",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar el correo de confirmacion." },
      { status: 400 },
    );
  }
}
