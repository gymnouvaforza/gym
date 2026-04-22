import type { MembershipPlan } from "@/lib/memberships";

export interface MembershipRequestFormValues {
  membershipPlanId: string;
  cycleStartsOn: string;
  cycleEndsOn: string;
  notes: string;
}

export function toMembershipRequestFormValues(defaultPlanId?: string | null, plans?: MembershipPlan[]): MembershipRequestFormValues {
  return {
    membershipPlanId: defaultPlanId ?? plans?.[0]?.id ?? "",
    cycleStartsOn: "",
    cycleEndsOn: "",
    notes: "",
  };
}
