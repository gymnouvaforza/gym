import { NextResponse } from "next/server";

import { getPublicMembershipStatusByToken } from "@/lib/data/memberships";
import { parseMembershipQrScannedValue } from "@/lib/membership-qr";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ token: string }>;
  },
) {
  const { token } = await context.params;
  const normalizedToken = parseMembershipQrScannedValue(token);

  if (!normalizedToken) {
    return NextResponse.json(
      { error: "El QR de membresia no tiene un formato valido." },
      { status: 400 },
    );
  }

  try {
    const status = await getPublicMembershipStatusByToken(normalizedToken);

    if (!status) {
      return NextResponse.json(
        { error: "No encontramos una membresia asociada a este QR." },
        { status: 404 },
      );
    }

    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo consultar el estado publico de la membresia.",
      },
      { status: 500 },
    );
  }
}
