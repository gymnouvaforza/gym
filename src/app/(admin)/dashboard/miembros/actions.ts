"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import {
  assignRoutineToMember,
  createMemberProfile,
  updateMemberProfile,
  deleteMemberProfile,
} from "@/lib/data/gym-management";
import type { AssignRoutineInput } from "@mobile-contracts";
import type { MemberFormValues } from "@/lib/validators/gym-members";

function revalidateMembers() {
  revalidatePath("/dashboard/miembros");
  revalidatePath("/dashboard/mobile");
}

function resolveActorUserId(user: Awaited<ReturnType<typeof requireAdminUser>>) {
  if ("isLocalAdmin" in user && user.isLocalAdmin) {
    return null;
  }

  return user.id;
}

export async function deleteMemberAction(memberId: string) {
  await requireAdminUser();
  await deleteMemberProfile(memberId);
  revalidateMembers();
}

export async function saveMemberProfileAction(values: MemberFormValues, memberId?: string) {
  await requireAdminUser();

  if (memberId) {
    await updateMemberProfile(memberId, values);
  } else {
    await createMemberProfile(values);
  }

  revalidateMembers();
}

export async function assignRoutineFromDashboardAction(values: AssignRoutineInput) {
  const user = await requireAdminUser();
  await assignRoutineToMember(values, resolveActorUserId(user));
  revalidateMembers();
  revalidatePath(`/dashboard/miembros/${values.memberId}`);
  revalidatePath("/dashboard/rutinas");
}
