import { NextResponse } from "next/server";
import { onboardingSchema } from "@/lib/validators/onboarding";
import { getFirebaseAdminAuth } from "@/lib/firebase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendFirebaseVerificationEmail } from "@/lib/firebase/email-actions";
import { SITE_URL } from "@/lib/seo";
import { createApiErrorResponse } from "@/lib/api-errors";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = onboardingSchema.parse(body);

    const auth = getFirebaseAdminAuth();
    
    // 1. Crear usuario en Firebase
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: parsed.email,
        password: parsed.password,
        displayName: parsed.fullName,
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "auth/email-already-exists") {
        return createApiErrorResponse("Ya existe una cuenta con este email.", { status: 400 });
      }
      throw error;
    }

    // 2. Crear perfil en Supabase
    const { generateMemberNumber } = await import("@/lib/data/gym-management");
    const supabase = createSupabaseAdminClient();
    const { error: supabaseError } = await supabase.from("member_profiles").insert({
      email: parsed.email.toLowerCase(),
      full_name: parsed.fullName,
      phone: parsed.phone,
      supabase_user_id: userRecord.uid,
      status: "active",
      join_date: new Date().toISOString().split("T")[0],
      member_number: generateMemberNumber(),
    });

    if (supabaseError) {
      // Cleanup Firebase user if Supabase fail (simple rollback)
      await auth.deleteUser(userRecord.uid).catch(() => undefined);
      throw new Error(`Error al crear perfil de socio: ${supabaseError.message}`);
    }

    // 3. Enviar correo de verificación
    try {
      const origin = new URL(request.url).origin;
      await sendFirebaseVerificationEmail({
        absoluteOrigin: origin,
        email: parsed.email,
        nextPath: "/registro/completado?confirmed=1",
      });
    } catch (emailError) {
      console.error("Fallo al enviar correo de verificacion:", emailError);
    }

    // 4. Trigger welcome email (opcional)
    void fetch(`${SITE_URL}/api/auth/welcome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.email }),
    }).catch(() => undefined);

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    return createApiErrorResponse(error, { fallbackMessage: "Error inesperado en el registro." });
  }
}
