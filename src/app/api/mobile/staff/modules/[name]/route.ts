import { NextResponse } from "next/server";

import {
  UpdateMobileSystemModuleInputSchema,
  type UpdateMobileSystemModuleResponse,
} from "@mobile-contracts";

import { setSystemModuleState } from "@/lib/data/modules-admin";
import { listSystemModules } from "@/lib/data/modules";
import { isKnownSystemModuleName } from "@/lib/module-flags";
import { requireMobileSuperadminSession } from "@/lib/mobile/auth";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const session = await requireMobileSuperadminSession(request);

  if (session.response) {
    return session.response;
  }

  const { name } = await context.params;

  if (!isKnownSystemModuleName(name)) {
    return NextResponse.json({ error: "Modulo desconocido." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateMobileSystemModuleInputSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Payload invalido para actualizar el modulo.");
  }

  try {
    await setSystemModuleState(name, parsed.data.isEnabled);
    const updatedModule = (await listSystemModules()).find((module) => module.name === name);

    if (!updatedModule) {
      return NextResponse.json({ error: "Modulo no encontrado." }, { status: 404 });
    }

    const response = {
      item: {
        name: updatedModule.name,
        label: updatedModule.label,
        description: updatedModule.description ?? "",
        disabledImpact: updatedModule.disabledImpact,
        isEnabled: updatedModule.is_enabled,
        updatedAt: updatedModule.updated_at,
      },
    } satisfies UpdateMobileSystemModuleResponse;

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el modulo." },
      { status: 400 },
    );
  }
}
