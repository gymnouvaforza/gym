"use server";

import { requireSuperadminUser } from "@/lib/auth";
import { setSystemModuleState } from "@/lib/data/modules-admin";
import type { ModuleActionResponse, SystemModuleName } from "@/lib/module-flags";

export async function toggleModuleAction(
  name: SystemModuleName,
  nextEnabled: boolean,
): Promise<ModuleActionResponse> {
  try {
    await requireSuperadminUser();
    return await setSystemModuleState(name, nextEnabled);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar el modulo.",
    };
  }
}
