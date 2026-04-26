import { NextResponse } from "next/server";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createLeadRecord } from "@/lib/supabase/queries";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validators/contact";
import { validateBody, withApiErrorHandling, applyRateLimit, getClientIp } from "./api-utils";

export async function handleLeadIntakeRequest(request: Request) {
  return withApiErrorHandling(async (): Promise<NextResponse> => {
    // Aplicamos rate limit (3 por minuto)
    const ip = getClientIp(request);
    const rateLimit = await applyRateLimit(`lead-intake:${ip}`, 3, 60000);
    if (!rateLimit.success) return rateLimit.errorResponse;

    const validated = await validateBody(request, contactFormSchema);
    if ("errorResponse" in validated) return validated.errorResponse;

    if (!hasSupabasePublicEnv()) {
      return NextResponse.json(
        { error: "Supabase no esta configurado todavia." },
        { status: 503 },
      );
    }

    const supabase = createSupabasePublicClient();
    await createLeadRecord(supabase, validated.data);

    return NextResponse.json({
      success: true,
      message: "Solicitud guardada correctamente.",
    });
  });
}
