"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import { syncMembershipRequestToMedusa } from "@/lib/data/membership-commerce";
import {
  addMembershipPaymentEntry,
  addMembershipRequestAnnotation,
  createMembershipRequest,
  deleteMembershipRequest,
  updateMembershipRequestStatus,
} from "@/lib/data/memberships";
import {
  membershipAdminCreateRequestSchema,
  membershipPaymentEntrySchema,
  membershipRequestAnnotationSchema,
  type MembershipAdminCreateRequestInput,
  type MembershipPaymentEntryInput,
  type MembershipRequestAnnotationInput,
} from "@/lib/validators/memberships";

function revalidateMembershipAdmin(membershipRequestId?: string, memberId?: string) {
  revalidatePath("/dashboard/membresias");
  revalidatePath("/dashboard/membresias/pedidos");
  revalidatePath("/dashboard/miembros");
  revalidatePath("/mi-cuenta");

  if (membershipRequestId) {
    revalidatePath(`/dashboard/membresias/pedidos/${membershipRequestId}`);
    revalidatePath(`/mi-cuenta/membresias/${membershipRequestId}`);
  }

  if (memberId) {
    revalidatePath(`/dashboard/miembros/${memberId}`);
  }
}

function resolveActor(
  user: Awaited<ReturnType<typeof requireAdminUser>>,
): { createdByEmail: string | null; createdByUserId: string | null } {
  return {
    createdByEmail: user.email ?? null,
    createdByUserId: "isLocalAdmin" in user && user.isLocalAdmin ? null : user.id,
  };
}

export async function createMembershipRequestFromDashboardAction(
  values: MembershipAdminCreateRequestInput,
) {
  await requireAdminUser();
  const parsed = membershipAdminCreateRequestSchema.parse(values);
  const request = await createMembershipRequest({
    ...parsed,
    source: "admin-dashboard",
  });

  revalidateMembershipAdmin(request.id, request.member.id);

  return {
    id: request.id,
    memberId: request.member.id,
    requestNumber: request.requestNumber,
  };
}

export async function updateMembershipRequestStatusAction(
  membershipRequestId: string,
  status: string,
  memberId?: string,
) {
  await requireAdminUser();
  await updateMembershipRequestStatus(membershipRequestId, status as never);
  revalidateMembershipAdmin(membershipRequestId, memberId);
}

export async function addMembershipRequestAnnotationAction(
  membershipRequestId: string,
  values: MembershipRequestAnnotationInput,
  memberId?: string,
) {
  const user = await requireAdminUser();
  const actor = resolveActor(user);
  const parsed = membershipRequestAnnotationSchema.parse(values);

  await addMembershipRequestAnnotation({
    membershipRequestId,
    values: parsed,
    createdByEmail: actor.createdByEmail,
    createdByUserId: actor.createdByUserId,
  });

  revalidateMembershipAdmin(membershipRequestId, memberId);
}

export async function addMembershipPaymentEntryAction(
  membershipRequestId: string,
  values: MembershipPaymentEntryInput,
  memberId?: string,
) {
  const user = await requireAdminUser();
  const actor = resolveActor(user);
  const parsed = membershipPaymentEntrySchema.parse(values);

  await addMembershipPaymentEntry({
    membershipRequestId,
    values: parsed,
    createdByEmail: actor.createdByEmail,
    createdByUserId: actor.createdByUserId,
  });

  revalidateMembershipAdmin(membershipRequestId, memberId);
}

export async function retryMembershipRequestCommerceSyncAction(
  membershipRequestId: string,
  memberId?: string,
) {
  await requireAdminUser();
  await syncMembershipRequestToMedusa(membershipRequestId);
  revalidateMembershipAdmin(membershipRequestId, memberId);
}

export async function deleteMembershipRequestAction(
  membershipRequestId: string,
  memberId?: string,
) {
  await requireAdminUser();
  const deleted = await deleteMembershipRequest(membershipRequestId);
  revalidateMembershipAdmin(membershipRequestId, memberId ?? deleted.memberId);
}
