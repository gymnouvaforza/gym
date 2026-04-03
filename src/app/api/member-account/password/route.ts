import { NextResponse } from "next/server";

import { getCurrentMemberUser } from "@/lib/auth";
import { changeAuthenticatedMemberPassword } from "@/lib/data/member-account";

export async function PATCH(request: Request) {
  const user = await getCurrentMemberUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Necesitas iniciar sesion para cambiar tu contrasena." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    await changeAuthenticatedMemberPassword(body);
    return NextResponse.json({ message: "Contrasena actualizada correctamente." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo cambiar la contrasena." },
      { status: 400 },
    );
  }
}
