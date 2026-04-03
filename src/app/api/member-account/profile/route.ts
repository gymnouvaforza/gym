import { NextResponse } from "next/server";

import { getCurrentMemberUser } from "@/lib/auth";
import { updateAuthenticatedMemberAccount } from "@/lib/data/member-account";

export async function PATCH(request: Request) {
  const user = await getCurrentMemberUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Necesitas iniciar sesion para editar tu cuenta." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const account = await updateAuthenticatedMemberAccount(body);
    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar la cuenta." },
      { status: 400 },
    );
  }
}
