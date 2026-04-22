import { MousePointer2 } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";

export function CmsCtaSection() {
  return (
    <AdminSection title="Acción (CTA)" icon={MousePointer2} description="Botón opcional al final del documento">
      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormField
          name="cta_label"
          label="Texto del Botón"
          placeholder="Ej. Volver al inicio"
        />
        <AdminFormField
          name="cta_href"
          label="Enlace del Botón"
          placeholder="Ej. / o https://..."
        />
      </div>
    </AdminSection>
  );
}
