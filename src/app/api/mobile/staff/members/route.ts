import { NextResponse } from "next/server";

import { createMemberProfile, listLiveStaffMembers } from "@/lib/data/gym-management";
import { requireMobileStaffSession } from "@/lib/mobile/auth";
import { CreateMemberInputSchema } from "@mobile-contracts";

export async function GET(request: Request) {
  const session = await requireMobileStaffSession(request);

  if (session.response) {
    return session.response;
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  return NextResponse.json({
    items: await listLiveStaffMembers(q),
  });
}

export async function POST(request: Request) {
  const session = await requireMobileStaffSession(request);

  if (session.response) {
    return session.response;
  }

  const body = await request.json().catch(() => ({}));

  try {
    const parsed = CreateMemberInputSchema.parse(body);
    const memberId = await createMemberProfile({
      linkedUserId: parsed.linkedUserId ?? null,
      trainerUserId: parsed.trainerUserId ?? null,
      fullName: parsed.fullName,
      email: parsed.email,
      phone: parsed.phone ?? null,
      status: parsed.status,
      branchName: parsed.branchName ?? null,
      notes: parsed.notes ?? null,
      joinDate: parsed.joinDate,
      planLabel: parsed.planLabel,
      planStatus: parsed.planStatus,
      planStartedAt: parsed.planStartedAt ?? null,
      planEndsAt: parsed.planEndsAt ?? null,
      planNotes: parsed.planNotes ?? null,
    });

    return NextResponse.json({ memberId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el miembro." },
      { status: 400 },
    );
  }
}
