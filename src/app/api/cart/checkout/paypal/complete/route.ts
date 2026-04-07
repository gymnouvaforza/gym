import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "PayPal ya no forma parte del storefront. Usa la reserva asistida del carrito y cierra la venta por WhatsApp con el equipo.",
    },
    { status: 410 },
  );
}
