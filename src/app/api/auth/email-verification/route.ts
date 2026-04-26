import { NextResponse } from "next/server";
import { z } from "zod";

import { sendFirebaseVerificationEmail } from "@/lib/firebase/email-actions";
import { sanitizeMemberRedirectPath } from "@/lib/member-auth-flow";
import { validateBody, withApiErrorHandling } from "@/lib/api-utils";

const EmailVerificationSchema = z.object({
  email: z.string().trim().email(),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const validated = await validateBody(request, EmailVerificationSchema);
    if ("errorResponse" in validated) return validated.errorResponse;
    const { email, next } = validated.data;

    const origin = new URL(request.url).origin;
    await sendFirebaseVerificationEmail({
      absoluteOrigin: origin,
      email: email.toLowerCase(),
      nextPath: sanitizeMemberRedirectPath(next) || "/registro/completado?confirmed=1",
    });

    return NextResponse.json({ success: true });
  });
}
