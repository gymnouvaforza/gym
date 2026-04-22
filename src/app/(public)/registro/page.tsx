import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingOrchestrator } from "@/features/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentMemberUser } from "@/lib/auth";
import { hasSupabasePublicEnv } from "@/lib/env";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildNoIndexMetadata(
  "Registro de socios",
  "Pantalla privada para crear el acceso web del socio.",
);

export default async function MemberRegisterPage() {
  const user = await getCurrentMemberUser();

  if (user) {
    redirect("/mi-cuenta");
  }

  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-16">
      {hasSupabasePublicEnv() ? (
        <OnboardingOrchestrator />
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Configura Supabase antes de habilitar el registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-[#5f6368]">
            <p>
              Falta configurar <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
