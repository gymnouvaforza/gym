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
import { memberFormSchema, type MemberFormValues } from "@/lib/validators/gym-members";
import { assignRoutineFormSchema } from "@/lib/validators/gym-routines";

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
  const user = await requireAdminUser();
  const validatedValues = memberFormSchema.parse(values);

  if (memberId) {
    await updateMemberProfile(memberId, validatedValues);
  } else {
    await createMemberProfile(validatedValues);
  }

  revalidateMembers();
}

export async function assignRoutineFromDashboardAction(values: AssignRoutineInput) {
  const user = await requireAdminUser();
  const validatedValues = assignRoutineFormSchema.parse(values);
  await assignRoutineToMember(validatedValues, resolveActorUserId(user));
  revalidateMembers();
  revalidatePath(`/dashboard/miembros/${values.memberId}`);
  revalidatePath("/dashboard/rutinas");
}
