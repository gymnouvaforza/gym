import { NextResponse } from "next/server";

import { getLiveMobileSession } from "@/lib/data/gym-management";
import { requireMobileSession } from "@/lib/mobile/auth";
import { withApiErrorHandling } from "@/lib/api-utils";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const session = await requireMobileSession(request);

    if (session.response || !session.user) {
      return session.response!;
    }

    return NextResponse.json(
      await getLiveMobileSession(session.user, session.role!, session.staffAccessLevel),
    );
  });
}
