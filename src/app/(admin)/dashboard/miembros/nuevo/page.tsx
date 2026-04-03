import AdminSection from "@/components/admin/AdminSection";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import MemberProfileForm from "@/components/admin/MemberProfileForm";
import {
  listDashboardAuthLinkOptions,
  listDashboardTrainerOptions,
} from "@/lib/data/gym-management";
import { UserPlus } from "lucide-react";

export default async function DashboardNewMemberPage() {
  const [authOptions, trainerOptions] = await Promise.all([
    listDashboardAuthLinkOptions(),
    listDashboardTrainerOptions(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Nuevo miembro"
        description="Alta operativa con plan resumido, opcion de vincular Auth y asignacion de entrenador."
        icon={UserPlus}
        eyebrow="Miembros"
      />

      <AdminSection
        title="Ficha operativa"
        description="Esta es la fuente principal para la app mobile y para el seguimiento interno."
      >
        <MemberProfileForm authOptions={authOptions} trainerOptions={trainerOptions} />
      </AdminSection>
    </div>
  );
}
