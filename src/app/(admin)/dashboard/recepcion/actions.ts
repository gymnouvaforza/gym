"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import {
  searchReceptionMembers,
  getReceptionMemberSnapshot,
  createMemberCheckin,
  listTodayMemberCheckins,
  listMemberCheckins,
} from "@/lib/data/member-checkins";

function resolveActorInfo(user: Awaited<ReturnType<typeof requireAdminUser>>) {
  if ("isLocalAdmin" in user && user.isLocalAdmin) {
    return { userId: user.id, email: user.email };
  }
  return { userId: user.id, email: user.email ?? null };
}

export async function searchReceptionMembersAction(query: string) {
  await requireAdminUser();
  return searchReceptionMembers(query);
}

export async function getReceptionMemberSnapshotAction(memberId: string) {
  await requireAdminUser();
  return getReceptionMemberSnapshot(memberId);
}

export async function createMemberCheckinAction(memberId: string) {
  const user = await requireAdminUser();
  const actor = resolveActorInfo(user);

  const checkin = await createMemberCheckin({
    memberId,
    method: "manual",
    registeredByUserId: actor.userId,
    registeredByEmail: actor.email,
  });

  revalidatePath("/dashboard/recepcion");
  revalidatePath(`/dashboard/miembros/${memberId}`);

  return checkin;
}

export async function listTodayMemberCheckinsAction() {
  await requireAdminUser();
  return listTodayMemberCheckins();
}

export async function listMemberCheckinsAction(memberId: string) {
  await requireAdminUser();
  return listMemberCheckins(memberId);
}
