import { z } from "zod";

import { CreateMemberInputSchema, MemberStatusSchema } from "@mobile-contracts";

function nullableTrimmedString(max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }, z.string().max(max).nullable());
}

export const memberPlanStatusSchema = z.enum(["active", "paused", "cancelled", "expired"]);

export const memberFormSchema = CreateMemberInputSchema.extend({
  linkedUserId: z.string().uuid().nullable(),
  trainerUserId: z.string().uuid().nullable(),
  phone: nullableTrimmedString(40),
  branchName: nullableTrimmedString(120),
  notes: nullableTrimmedString(1000),
  planNotes: nullableTrimmedString(1000),
  planStartedAt: z.string().nullable(),
  planEndsAt: z.string().nullable(),
});

export type MemberFormValues = z.input<typeof memberFormSchema>;

export const memberStatusUpdateSchema = z.object({
  status: MemberStatusSchema,
});

export const memberMobilePatchSchema = z.object({
  status: MemberStatusSchema.optional(),
  branchName: nullableTrimmedString(120).optional(),
  notes: nullableTrimmedString(1000).optional(),
});

export type MemberMobilePatchValues = z.input<typeof memberMobilePatchSchema>;
