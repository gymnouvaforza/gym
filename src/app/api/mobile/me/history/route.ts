import { NextResponse } from "next/server";

import { getLiveHistoryForSession, getLiveMobileSession } from "@/lib/data/gym-management";
import { requireMobileSession } from "@/lib/mobile/auth";

export async function GET(request: Request) {
  const session = await requireMobileSession(request);

  if (session.response) {
    return session.response;
  }

  const mobileSession = await getLiveMobileSession(session.user!, session.role!);
  return NextResponse.json(await getLiveHistoryForSession(mobileSession));
}
