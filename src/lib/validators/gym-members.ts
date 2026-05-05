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

export const dashboardMemberStatusSchema = z.enum([
  "prospect",
  "active",
  "paused",
  "cancelled",
  "former",
  "expired",
  "frozen",
]);

const nullableDateString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable());

const nullableGender = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}, z.enum(["M", "F"]).nullable());

export const memberFormSchema = CreateMemberInputSchema.extend({
  externalCode: z.string().trim().min(1).max(50).optional(),
  linkedUserId: z.string().uuid().nullable(),
  trainerUserId: z.string().uuid().nullable(),
  status: dashboardMemberStatusSchema.default("prospect"),
  phone: nullableTrimmedString(40),
  birthDate: nullableDateString,
  gender: nullableGender,
  address: nullableTrimmedString(200),
  districtOrUrbanization: nullableTrimmedString(100),
  occupation: nullableTrimmedString(100),
  preferredSchedule: nullableTrimmedString(100),
  branchName: nullableTrimmedString(120),
  notes: nullableTrimmedString(1000),
  legacyNotes: nullableTrimmedString(2000),
  planNotes: nullableTrimmedString(1000),
  planStartedAt: z.string().nullable(),
  planEndsAt: z.string().nullable(),
  profileCompleted: z.boolean().default(false),
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
