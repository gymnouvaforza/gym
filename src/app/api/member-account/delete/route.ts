import { NextResponse } from "next/server";

import { deleteAuthenticatedMemberAccount } from "@/lib/data/member-account";
import { requireFirebaseUser, withApiErrorHandling, validateRequestOrigin } from "@/lib/api-utils";

export async function POST(request: Request) {
  return withApiErrorHandling(async (): Promise<NextResponse> => {
    const originCheck = validateRequestOrigin(request);
    if (!originCheck.success) return originCheck.errorResponse;

    const auth = await requireFirebaseUser();
    if (!auth.success) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));

    await deleteAuthenticatedMemberAccount(body);
    return NextResponse.json({ message: "Cuenta eliminada correctamente." });
  });
}
