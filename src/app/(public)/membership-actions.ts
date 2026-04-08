"use server";

import { revalidatePath } from "next/cache";

import { requireMemberUser } from "@/lib/auth";
import {
  createMembershipRequest,
  createMembershipRequestForUser,
} from "@/lib/data/memberships";
import { ensureMemberProfileForUser } from "@/lib/data/gym-management";
import { membershipPlanReserveSchema } from "@/lib/validators/memberships";

function revalidateMembershipSurfaces() {
  revalidatePath("/planes");
  revalidatePath("/mi-cuenta");
  revalidatePath("/dashboard/miembros");
  revalidatePath("/dashboard/membresias");
}

export async function reserveMembershipPlanAction(input: {
  membershipPlanId: string;
  notes?: string | null;
  renewsFromRequestId?: string | null;
}) {
  const user = await requireMemberUser("/acceso?next=/planes");
  const parsed = membershipPlanReserveSchema.parse({
    membershipPlanId: input.membershipPlanId,
    notes: input.notes ?? null,
  });

  const request = input.renewsFromRequestId
    ? await createMembershipRequest({
        memberId: (await ensureMemberProfileForUser(user)).id,
        membershipPlanId: parsed.membershipPlanId,
        notes: parsed.notes,
        renewsFromRequestId: input.renewsFromRequestId,
        source: "renewal",
        supabaseUserId: user.id,
      })
    : await createMembershipRequestForUser(user, parsed);

  revalidateMembershipSurfaces();

  return {
    id: request.id,
    requestNumber: request.requestNumber,
  };
}
