import { NextResponse } from "next/server";

import { getLiveMobileSession, updateLiveRoutineFeedbackForSession } from "@/lib/data/gym-management";
import { requireMobileSession } from "@/lib/mobile/auth";

export async function PATCH(request: Request) {
  const session = await requireMobileSession(request);

  if (session.response || !session.user) {
    return session.response!;
  }

  const mobileSession = await getLiveMobileSession(session.user, session.role!);
  const body = await request.json().catch(() => ({}));

  try {
    return NextResponse.json({
      routine: await updateLiveRoutineFeedbackForSession(mobileSession, body),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo guardar el feedback de la rutina." },
      { status: 400 },
    );
  }
}
