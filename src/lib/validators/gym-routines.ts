import { z } from "zod";

import { AssignRoutineInputSchema } from "@mobile-contracts";

function nullableTrimmedString(max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }, z.string().max(max).nullable());
}

export const routineExerciseFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  sets: z.string().trim().min(1).max(30),
  reps: z.string().trim().min(1).max(30),
  restSeconds: z.coerce.number().int().min(0).max(3600),
  notes: nullableTrimmedString(280),
});

export const routineBlockFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(120),
  description: nullableTrimmedString(280),
  exercises: z.array(routineExerciseFormSchema).min(1),
});

export const routineTemplateFormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  goal: z.string().trim().min(2).max(160),
  summary: z.string().trim().min(2).max(500),
  durationLabel: z.string().trim().min(2).max(60),
  difficultyLabel: z.string().trim().min(2).max(60),
  intensityLabel: z.string().trim().min(2).max(60),
  statusLabel: z.string().trim().min(2).max(60),
  isActive: z.boolean(),
  notes: nullableTrimmedString(1000),
  trainerUserId: z.string().uuid().nullable(),
  blocks: z.array(routineBlockFormSchema).min(1),
});

export type RoutineTemplateFormValues = z.input<typeof routineTemplateFormSchema>;

export const assignRoutineFormSchema = AssignRoutineInputSchema.extend({
  startsOn: z.string().nullable().optional(),
  endsOn: z.string().nullable().optional(),
  recommendedScheduleLabel: z.string().trim().max(120).nullable().optional(),
});

export type AssignRoutineFormValues = z.output<typeof assignRoutineFormSchema>;
