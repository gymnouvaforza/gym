import { NextResponse } from "next/server";

import { getLiveStaffDashboard } from "@/lib/data/gym-management";
import { requireMobileStaffSession } from "@/lib/mobile/auth";
import { withApiErrorHandling } from "@/lib/api-utils";

export async function GET(request: Request) {
  return withApiErrorHandling(async () => {
    const session = await requireMobileStaffSession(request);

    if (session.response) {
      return session.response;
    }

    return NextResponse.json(await getLiveStaffDashboard());
  });
}
