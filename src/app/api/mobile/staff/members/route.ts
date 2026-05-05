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
      address: null,
      birthDate: null,
      branchName: parsed.branchName ?? null,
      districtOrUrbanization: null,
      email: parsed.email,
      externalCode: `MOB-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      fullName: parsed.fullName,
      gender: null,
      joinDate: parsed.joinDate,
      legacyNotes: null,
      linkedUserId: parsed.linkedUserId ?? null,
      notes: parsed.notes ?? null,
      occupation: null,
      phone: parsed.phone ?? null,
      planEndsAt: parsed.planEndsAt ?? null,
      planLabel: parsed.planLabel,
      planNotes: parsed.planNotes ?? null,
      planStartedAt: parsed.planStartedAt ?? null,
      planStatus: parsed.planStatus,
      preferredSchedule: null,
      profileCompleted: false,
      status: parsed.status,
      trainerUserId: parsed.trainerUserId ?? null,
    });

    return NextResponse.json({ memberId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el miembro." },
      { status: 400 },
    );
  }
}
