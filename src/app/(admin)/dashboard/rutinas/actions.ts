"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth";
import {
  createRoutineTemplate,
  updateRoutineTemplate,
} from "@/lib/data/gym-management";
import type { RoutineTemplateFormValues } from "@/lib/validators/gym-routines";

function resolveActorUserId(user: Awaited<ReturnType<typeof requireAdminUser>>) {
  if ("isLocalAdmin" in user && user.isLocalAdmin) {
    return null;
  }

  return user.id;
}

function revalidateRoutines() {
  revalidatePath("/dashboard/rutinas");
  revalidatePath("/dashboard/miembros");
}

export async function saveRoutineTemplateAction(
  values: RoutineTemplateFormValues,
  templateId?: string,
) {
  const user = await requireAdminUser();

  if (templateId) {
    await updateRoutineTemplate(templateId, values);
  } else {
    await createRoutineTemplate(values, resolveActorUserId(user));
  }

  revalidateRoutines();
}
