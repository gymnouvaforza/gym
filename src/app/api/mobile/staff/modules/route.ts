import { NextResponse } from "next/server";

import type { MobileSystemModulesResponse } from "@mobile-contracts";

import { listSystemModules } from "@/lib/data/modules";
import { requireMobileSuperadminSession } from "@/lib/mobile/auth";

export async function GET(request: Request) {
  const session = await requireMobileSuperadminSession(request);

  if (session.response) {
    return session.response;
  }

  const items = (await listSystemModules()).map((module) => ({
    name: module.name,
    label: module.label,
    description: module.description ?? "",
    disabledImpact: module.disabledImpact,
    isEnabled: module.is_enabled,
    updatedAt: module.updated_at,
  })) satisfies MobileSystemModulesResponse["items"];

  return NextResponse.json({ items });
}
