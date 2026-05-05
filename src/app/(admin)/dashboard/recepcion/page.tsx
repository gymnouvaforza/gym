import { DoorOpen } from "lucide-react";

import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import ReceptionWorkspace from "@/components/admin/ReceptionWorkspace";
import { requireAdminUser } from "@/lib/auth";
import { listTodayMemberCheckins } from "@/lib/data/member-checkins";

export default async function DashboardReceptionPage() {
  await requireAdminUser();
  const todayCheckins = await listTodayMemberCheckins();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="RECEPCION"
          description="Busqueda rapida de socios, registro de entradas y control de asistencias del dia. La recepcion decide si deja entrar; el sistema avisa, no bloquea."
          eyebrow="Operaciones Gym"
          icon={DoorOpen}
          className="pb-0"
        />
      </div>

      <ReceptionWorkspace initialTodayCheckins={todayCheckins} />
    </div>
  );
}
