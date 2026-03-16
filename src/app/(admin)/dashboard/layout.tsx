import type { ReactNode } from "react";

import DashboardSidebar from "@/components/admin/DashboardSidebar";
import SignOutButton from "@/components/admin/SignOutButton";
import { Card } from "@/components/ui/card";
import { ADMIN_LOGIN_PATH } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { hasSupabasePublicEnv } from "@/lib/env";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  if (!hasSupabasePublicEnv()) {
    return (
      <div className="section-shell py-10">
        <Card className="border-white/10 bg-zinc-950/80 p-6 text-sm text-zinc-300">
          Configura Supabase para usar el backoffice interno.
        </Card>
      </div>
    );
  }

  const user = await requireUser(`${ADMIN_LOGIN_PATH}?next=/dashboard`);

  return (
    <div className="section-shell py-8">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#f87171]">
            Backoffice del gimnasio
          </p>
          <p className="mt-2 text-sm text-zinc-400">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DashboardSidebar />
        <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950/70 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
