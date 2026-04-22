import { Calendar } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";

export function MembershipCycleSection() {
  return (
    <AdminSection title="Ciclo de Membresía" icon={Calendar}>
      <div className="grid gap-6 md:grid-cols-2">
        <AdminFormField
          name="cycleStartsOn"
          label="Inicio del Ciclo"
          type="date"
          inputClassName="font-bold"
        />
        <AdminFormField
          name="cycleEndsOn"
          label="Fin del Ciclo"
          type="date"
          inputClassName="font-bold"
        />
      </div>
    </AdminSection>
  );
}
