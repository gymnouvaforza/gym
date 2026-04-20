"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { applyActionCode } from "firebase/auth";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseBrowserAuth } from "@/lib/firebase/client";

export default function AuthConfirmClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const next = searchParams.get("next") || "/registro/completado?confirmed=1";

  useEffect(() => {
    let active = true;

    void (async () => {
      if (!oobCode || !mode) {
        setError("El enlace de confirmacion no es valido o ya caducado.");
        return;
      }

      const auth = await getFirebaseBrowserAuth();

      if (!auth) {
        setError("Firebase Auth no esta configurado.");
        return;
      }

      try {
        await applyActionCode(auth, oobCode);

        if (!active) {
          return;
        }

        router.replace(next);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : "No pudimos validar el enlace.");
      }
    })();

    return () => {
      active = false;
    };
  }, [mode, next, oobCode, router]);

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Confirmando accion</CardTitle>
          <CardDescription>
            Estamos validando el enlace para completar la accion pendiente sobre tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <PublicInlineAlert
              tone="error"
              title="No pudimos validar el enlace"
              message={error}
              compact
            />
          ) : (
            <div className="rounded-none border border-black/8 bg-[#fbfbf8] p-5 text-sm leading-7 text-[#5f6368]">
              Procesando enlace seguro. No cierres esta ventana.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/acceso">Ir al acceso</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
