import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/features/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabasePublicEnv } from "@/lib/env";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Acceso al dashboard",
  "Pagina privada de acceso al panel del gimnasio.",
);

export default function LoginPage() {
  return (
    <div className="section-shell flex min-h-screen items-center justify-center py-16">
      {hasSupabasePublicEnv() ? (
        <Suspense
          fallback={
            <Card className="mx-auto w-full max-w-md">
              <CardHeader>
                <CardTitle>Cargando acceso</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-zinc-400">
                Preparando el formulario del backoffice...
              </CardContent>
            </Card>
          }
        >
          <LoginForm />
        </Suspense>
      ) : (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Configura Supabase antes de usar el backoffice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-zinc-400">
            <p>
              Falta configurar <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
            <p>
              Cuando el proyecto tenga esas variables y un usuario en Supabase Auth, este acceso
              activara el backoffice propio del gimnasio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
