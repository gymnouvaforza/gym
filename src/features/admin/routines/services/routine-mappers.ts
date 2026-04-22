import type { DashboardRoutineTemplateDetail } from "@/lib/data/gym-management";
import type { RoutineTemplateFormValues } from "@/lib/validators/gym-routines";

export function buildEmptyExercise() {
  return {
    name: "",
    notes: null,
    reps: "",
    restSeconds: 60,
    sets: "",
  };
}

export function buildEmptyBlock() {
  return {
    description: null,
    exercises: [buildEmptyExercise()],
    title: "",
  };
}

export function toRoutineFormValues(detail?: DashboardRoutineTemplateDetail | null): RoutineTemplateFormValues {
  return {
    title: detail?.template.title ?? "",
    goal: detail?.template.goal ?? "Hipertrofia",
    summary: detail?.template.summary ?? "",
    durationLabel: detail?.template.durationLabel ?? "60 min",
    difficultyLabel: detail?.template.difficultyLabel ?? "Media",
    intensityLabel: detail?.template.intensityLabel ?? "Moderada",
    statusLabel: detail?.template.statusLabel ?? "Activa",
    isActive: detail?.isActive ?? true,
    notes: detail?.template.notes ?? null,
    trainerUserId: detail?.trainerUserId ?? null,
    blocks:
      detail?.template.blocks.map((block) => ({
        description: block.description,
        exercises: block.exercises.map((exercise) => ({
          name: exercise.name,
          notes: exercise.notes,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          sets: exercise.sets,
        })),
        title: block.title,
      })) ?? [buildEmptyBlock()],
  };
}
