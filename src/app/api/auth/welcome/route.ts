import { NextResponse } from "next/server";
import { z } from "zod";

import { getSmtpEnv, hasSmtpEnv } from "@/lib/env";
import { sendMemberWelcomeEmail } from "@/lib/email/welcome-member";
import { resolveTransactionalSender } from "@/lib/email/policy";
import { getFirebaseAdminAuth } from "@/lib/firebase/server";
import { getMarketingData } from "@/lib/data/site";
import { validateBody, withApiErrorHandling } from "@/lib/api-utils";

const WelcomeBodySchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  return withApiErrorHandling(async () => {
    const validated = await validateBody(request, WelcomeBodySchema);
    if ("errorResponse" in validated) return validated.errorResponse;
    const { email } = validated.data;

    if (!hasSmtpEnv()) {
      return NextResponse.json({ queued: false, skipped: true }, { status: 202 });
    }

    try {
      const normalizedEmail = email.toLowerCase();
      const userExists = await getFirebaseAdminAuth()
        .getUserByEmail(normalizedEmail)
        .then(() => true)
        .catch(() => false);

      if (!userExists) {
        return NextResponse.json({ queued: false, skipped: true }, { status: 202 });
      }

      const { settings } = await getMarketingData();

      const smtp = getSmtpEnv();
      const sender = resolveTransactionalSender(
        settings.site_name,
        settings.transactional_from_email,
        smtp.fromEmail,
      );

      await sendMemberWelcomeEmail(
        email,
        settings.site_name,
        sender.fromEmail,
        sender.replyTo,
      );

      return NextResponse.json({ queued: true });
    } catch (error) {
      console.warn(
        "[Welcome Email] No se pudo enviar el correo de bienvenida:",
        error instanceof Error ? error.message : String(error),
      );

      return NextResponse.json({ queued: false }, { status: 202 });
    }
  });
}
