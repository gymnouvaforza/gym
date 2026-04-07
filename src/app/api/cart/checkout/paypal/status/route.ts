import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "disabled",
      message:
        "PayPal ya no forma parte del storefront. Usa la reserva asistida del carrito y cierra la venta por WhatsApp con el equipo.",
    },
    { status: 410 },
  );
}
