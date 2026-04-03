import { NextResponse } from "next/server";

import { getCurrentMemberUser } from "@/lib/auth";
import { deleteAuthenticatedMemberAccount } from "@/lib/data/member-account";

export async function POST(request: Request) {
  const user = await getCurrentMemberUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Necesitas iniciar sesion para eliminar tu cuenta." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    await deleteAuthenticatedMemberAccount(body);
    return NextResponse.json({ message: "Cuenta eliminada correctamente." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar la cuenta." },
      { status: 400 },
    );
  }
}
