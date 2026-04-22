import { ClipboardList } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

export function MembershipNotesSection() {
  return (
    <AdminSection title="Notas de Gestión" icon={ClipboardList} description="Observaciones internas sobre el cobro o la renovación">
      <AdminFormTextarea
        name="notes"
        label="Nota operativa"
        placeholder="Ejemplo: renovación acordada por recepción, socio paga en dos partes."
        rows={3}
      />
    </AdminSection>
  );
}
