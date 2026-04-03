import { NextResponse } from "next/server";

import { listLiveRoutineTemplates } from "@/lib/data/gym-management";
import { requireMobileStaffSession } from "@/lib/mobile/auth";

export async function GET(request: Request) {
  const session = await requireMobileStaffSession(request);

  if (session.response) {
    return session.response;
  }

  return NextResponse.json({
    items: await listLiveRoutineTemplates(),
  });
}
