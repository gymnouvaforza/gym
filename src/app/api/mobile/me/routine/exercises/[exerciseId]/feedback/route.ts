import { NextResponse } from "next/server";

import { getLiveMobileSession, updateLiveExerciseFeedbackForSession } from "@/lib/data/gym-management";
import { requireMobileSession } from "@/lib/mobile/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ exerciseId: string }> },
) {
  const session = await requireMobileSession(request);

  if (session.response || !session.user) {
    return session.response!;
  }

  const { exerciseId } = await context.params;
  const mobileSession = await getLiveMobileSession(
    session.user,
    session.role!,
    session.staffAccessLevel,
  );
  const body = await request.json().catch(() => ({}));

  try {
    return NextResponse.json({
      routine: await updateLiveExerciseFeedbackForSession(mobileSession, exerciseId, body),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo guardar el feedback del ejercicio." },
      { status: 400 },
    );
  }
}
