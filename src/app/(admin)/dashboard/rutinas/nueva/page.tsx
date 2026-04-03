import AdminSection from "@/components/admin/AdminSection";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import RoutineTemplateForm from "@/components/admin/RoutineTemplateForm";
import { listDashboardTrainerOptions } from "@/lib/data/gym-management";
import { LayoutTemplate } from "lucide-react";

export default async function DashboardNewRoutinePage() {
  const trainerOptions = await listDashboardTrainerOptions();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Nueva rutina"
        description="Crea una plantilla completa con bloques y ejercicios ordenables."
        icon={LayoutTemplate}
        eyebrow="Rutinas"
      />

      <AdminSection
        title="Editor completo"
        description="Este editor define la estructura que luego se asigna a los miembros desde dashboard o mobile staff."
      >
        <RoutineTemplateForm trainerOptions={trainerOptions} />
      </AdminSection>
    </div>
  );
}
