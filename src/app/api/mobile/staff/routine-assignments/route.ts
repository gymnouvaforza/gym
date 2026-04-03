import { NextResponse } from "next/server";

import { assignRoutineToMemberForMobile } from "@/lib/data/gym-management";
import { requireMobileStaffSession } from "@/lib/mobile/auth";

export async function POST(request: Request) {
  const session = await requireMobileStaffSession(request);

  if (session.response || !session.user?.email) {
    return session.response!;
  }

  const body = await request.json().catch(() => ({}));

  try {
    const result = await assignRoutineToMemberForMobile(body, session.user.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo preparar la asignación.",
      },
      { status: 400 },
    );
  }
}
