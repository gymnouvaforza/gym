import type { ReactNode } from "react";

import DashboardSidebar from "@/components/admin/DashboardSidebar";
import SignOutButton from "@/components/admin/SignOutButton";
import AdminSurface from "@/components/admin/AdminSurface";
import { Card } from "@/components/ui/card";
import { ADMIN_LOGIN_PATH } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import { hasSupabasePublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  if (!hasSupabasePublicEnv()) {
    return (
      <div className="min-h-screen bg-[#f6f3ec] px-4 py-10 sm:px-6 xl:px-8 2xl:px-10">
        <Card className="p-6 text-sm text-[#5f6368]">
          Configura Supabase para usar el backoffice interno.
        </Card>
      </div>
    );
  }

  const user = await requireAdminUser(`${ADMIN_LOGIN_PATH}?next=/dashboard&error=admin-only`);

  return (
    <div className="min-h-screen bg-[#f6f3ec]">
      <div className="w-full px-4 py-5 sm:px-6 lg:py-6 xl:px-8 2xl:px-10">
        <AdminSurface className="mb-6 px-5 py-5 sm:px-6 xl:px-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#d71920]">
                Backoffice del gimnasio
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] xl:text-[2rem]">
                Operacion diaria, sin ruido
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[#5f6368]">
                Leads, contenido y ajustes globales del gimnasio en una sola base.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:shrink-0">
              <div className="rounded-none border border-black/8 bg-[#fbfbf8] px-4 py-3 xl:min-w-[280px]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
                  Sesion activa
                </p>
                <p className="mt-1 text-sm font-medium text-[#111111]">{user.email}</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </AdminSurface>

        <div className="grid gap-6 xl:grid-cols-[304px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          <DashboardSidebar />
          <div className="min-w-0 space-y-6 xl:space-y-7">{children}</div>
        </div>
      </div>
    </div>
  );
}
