import { Search } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

export function CmsSeoSection() {
  return (
    <AdminSection title="Optimización SEO" icon={Search} description="Configuración para buscadores y redes sociales">
      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormField
          name="seo_title"
          label="Meta Título"
          placeholder="Ej. Privacidad | Nova Forza"
        />
        <AdminFormTextarea
          name="seo_description"
          label="Meta Descripción"
          rows={3}
        />
      </div>
    </AdminSection>
  );
}
