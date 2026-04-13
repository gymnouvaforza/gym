import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Cuenta eliminada");

export default function AccountDeletedPage() {
  return (
    <main className="section-shell flex min-h-screen items-center justify-center py-16">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Cuenta eliminada</CardTitle>
          <CardDescription>
            Tu acceso web ya se ha eliminado correctamente. Si mas adelante necesitas volver,
            tendras que registrarte de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-7 text-[#5f6368]">
            El historial operativo minimo del gimnasio puede mantenerse desacoplado para
            trazabilidad interna, pero tu acceso privado ya no existe.
          </p>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
