import { NextResponse } from "next/server";

import { getCurrentMemberUser } from "@/lib/auth";
import { sendFirebaseVerifyAndChangeEmail } from "@/lib/firebase/email-actions";
import { sanitizeMemberRedirectPath } from "@/lib/member-auth-flow";

export async function POST(request: Request) {
  const user = await getCurrentMemberUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Necesitas iniciar sesion." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    next?: string;
  };

  const nextEmail = body.email?.trim().toLowerCase();

  if (!nextEmail) {
    return NextResponse.json({ error: "Necesitamos un email valido." }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    await sendFirebaseVerifyAndChangeEmail({
      absoluteOrigin: origin,
      currentEmail: user.email,
      newEmail: nextEmail,
      nextPath: sanitizeMemberRedirectPath(body.next) || "/mi-cuenta",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar la confirmacion del nuevo email." },
      { status: 400 },
    );
  }
}
