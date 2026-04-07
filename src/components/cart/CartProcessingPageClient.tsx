"use client";

import Link from "next/link";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";

export default function CartProcessingPageClient({
  cartId,
}: Readonly<{
  cartId: string;
}>) {
  return (
    <section className="section-shell py-16">
      <div className="border border-amber-200 bg-white px-6 py-12 shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
        <PublicInlineAlert
          tone="warning"
          title="Flujo retirado"
          message="Esta pantalla ya no usa checkout online."
          compact
        />
        <h1 className="mt-4 font-display text-4xl uppercase text-[#111111]">
          Esta pantalla ya no usa checkout online
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#4b5563]">
          La tienda funciona ahora como reserva asistida. Si llegaste aqui desde una referencia
          antigua, no vuelvas a pagar: comparte el identificador con el equipo por WhatsApp y
          terminaran la gestion contigo desde el dashboard.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="border border-black/8 bg-[#fbfbf8] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
              Identificador operativo
            </p>
            <p className="mt-2 font-mono text-sm text-[#111111]">{cartId}</p>
          </div>
          <div className="border border-black/8 bg-[#fbfbf8] p-4 text-sm leading-6 text-[#5f6368]">
            Si ya habias enviado la reserva, revisa tu email o mi cuenta. Si no, vuelve al carrito y
            usa el flujo nuevo de reserva asistida.
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/carrito">Volver al carrito</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/mi-cuenta">Ir a Mi cuenta</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tienda">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
