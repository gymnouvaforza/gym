"use server";

import { revalidatePath } from "next/cache";

import { requireSuperadminUser } from "@/lib/auth";
import { 
  promoteUserToTrainer, 
  demoteTrainerFromUser,
  linkAuthUserToMemberProfile,
  toggleAppAccess,
  createMemberProfile
} from "@/lib/data/gym-management";

function resolveAssignedBy(user: Awaited<ReturnType<typeof requireSuperadminUser>>) {
  if ("isLocalAdmin" in user && user.isLocalAdmin) {
    return null;
  }

  return user.id;
}

export async function promoteDashboardUserToTrainer(userId: string) {
  const user = await requireSuperadminUser();
  await promoteUserToTrainer(userId, resolveAssignedBy(user));
  revalidatePath("/dashboard/mobile");
}

export async function demoteDashboardUserFromTrainer(userId: string) {
  await requireSuperadminUser();
  await demoteTrainerFromUser(userId);
  revalidatePath("/dashboard/mobile");
}

export async function linkUserToMemberAction(userId: string, memberId: string | null) {
  await requireSuperadminUser();
  await linkAuthUserToMemberProfile(userId, memberId);
  revalidatePath("/dashboard/mobile");
}

export async function toggleAppAccessAction(userId: string, shouldHaveAccess: boolean) {
  await requireSuperadminUser();
  await toggleAppAccess(userId, shouldHaveAccess);
  revalidatePath("/dashboard/mobile");
}

export async function quickCreateMemberAndLinkAction(userId: string, fullName: string, email: string) {
  await requireSuperadminUser();
  
  const memberId = await createMemberProfile({
    fullName,
    email,
    linkedUserId: userId,
    trainerUserId: null,
    status: "active",
    joinDate: new Date().toISOString().slice(0, 10),
    planLabel: "Plan App Directo",
    planStatus: "active",
    planStartedAt: new Date().toISOString().slice(0, 10),
    branchName: "Sede App",
    phone: null,
    notes: "Ficha creada mediante alta rapida desde Mobile Hub.",
    planEndsAt: null,
    planNotes: null,
  });

  revalidatePath("/dashboard/mobile");
  return memberId;
}
