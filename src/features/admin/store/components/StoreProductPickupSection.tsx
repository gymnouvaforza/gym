import { MapPin } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

export function StoreProductPickupSection() {
  return (
    <AdminSection title="Configuracion de Recogida" icon={MapPin}>
      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormTextarea
          name="pickup_note"
          label="Nota de recogida"
          placeholder="Instrucciones sobre dónde o cómo recoger..."
          rows={3}
        />
        <div className="space-y-5">
          <AdminFormField
            name="pickup_summary"
            label="Titular de recogida"
            placeholder="Ej. Recogida en Club Central"
          />
          <AdminFormField
            name="pickup_eta"
            label="Texto ETA (Tiempo estimado)"
            placeholder="Ej. Disponible en 24h"
          />
        </div>
      </div>
    </AdminSection>
  );
}
