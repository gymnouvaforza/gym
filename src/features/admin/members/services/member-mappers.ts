import type { DashboardMemberDetail } from "@/lib/data/gym-management";
import type { MemberFormValues } from "@/lib/validators/gym-members";

export function toMemberFormValues(detail?: DashboardMemberDetail | null): MemberFormValues {
  return {
    linkedUserId: detail?.member.linkedUserId ?? null,
    trainerUserId: detail?.member.trainerUserId ?? null,
    fullName: detail?.member.fullName ?? "",
    email: detail?.member.email ?? "",
    phone: detail?.member.phone ?? null,
    status: detail?.member.status ?? "prospect",
    branchName: detail?.member.branchName ?? null,
    notes: detail?.notes ?? null,
    joinDate: detail?.member.joinDate ?? new Date().toISOString().slice(0, 10),
    planLabel: detail?.plan?.label ?? "",
    planStatus: detail?.plan?.status ?? "active",
    planStartedAt: detail?.plan?.startedAt ?? null,
    planEndsAt: detail?.plan?.endsAt ?? null,
    planNotes: detail?.plan?.notes ?? null,
    // Legacy fields from Phase 1
    externalCode: detail?.member.externalCode ?? "",
    birthDate: detail?.member.birthDate ?? null,
    gender: detail?.member.gender ?? null,
    address: detail?.member.address ?? null,
    districtOrUrbanization: detail?.member.districtOrUrbanization ?? null,
    occupation: detail?.member.occupation ?? null,
    preferredSchedule: detail?.member.preferredSchedule ?? null,
    legacyNotes: detail?.member.legacyNotes ?? null,
    profileCompleted: detail?.member.profileCompleted ?? false,
  };
}
