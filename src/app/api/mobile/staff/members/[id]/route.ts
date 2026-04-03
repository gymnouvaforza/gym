import { NextResponse } from "next/server";

import { getLiveStaffMemberDetail, updateLiveMemberFromMobile } from "@/lib/data/gym-management";
import { requireMobileStaffSession } from "@/lib/mobile/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireMobileStaffSession(request);

  if (session.response) {
    return session.response;
  }

  const { id } = await context.params;

  const detail = await getLiveStaffMemberDetail(id);

  if (!detail) {
    return NextResponse.json({ error: "Miembro no encontrado." }, { status: 404 });
  }

  return NextResponse.json(detail);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireMobileStaffSession(request);

  if (session.response) {
    return session.response;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  try {
    await updateLiveMemberFromMobile(id, body);
    const detail = await getLiveStaffMemberDetail(id);

    if (!detail) {
      return NextResponse.json({ error: "Miembro no encontrado." }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el miembro." },
      { status: 400 },
    );
  }
}
