import { NextResponse } from "next/server";

import { getLiveMobileSession } from "@/lib/data/gym-management";
import { requireMobileSession } from "@/lib/mobile/auth";

export async function GET(request: Request) {
  const session = await requireMobileSession(request);

  if (session.response || !session.user) {
    return session.response!;
  }

  return NextResponse.json(await getLiveMobileSession(session.user, session.role!));
}
