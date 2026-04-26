import { NextResponse } from "next/server";

import { updateAuthenticatedMemberAccount } from "@/lib/data/member-account";
import { requireFirebaseUser, withApiErrorHandling, validateRequestOrigin } from "@/lib/api-utils";

export async function PATCH(request: Request) {
  return withApiErrorHandling(async (): Promise<NextResponse> => {
    const originCheck = validateRequestOrigin(request);
    if (!originCheck.success) return originCheck.errorResponse;

    const auth = await requireFirebaseUser();
    if (!auth.success) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));

    const account = await updateAuthenticatedMemberAccount(body, {
      absoluteOrigin: new URL(request.url).origin,
    });
    return NextResponse.json({ account });
  });
}
