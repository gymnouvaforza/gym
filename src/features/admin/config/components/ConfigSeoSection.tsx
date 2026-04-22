import { Search } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

interface ConfigSeoSectionProps {
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

export function ConfigSeoSection({ isCollapsible, defaultOpen }: ConfigSeoSectionProps) {
  return (
    <AdminSection 
      title="Optimización SEO" 
      icon={Search} 
      description="Cómo aparece el gym en Google y buscadores"
      isCollapsible={isCollapsible}
      defaultOpen={defaultOpen}
    >
      <div className="space-y-5">
        <AdminFormField
          name="seo_title"
          label="Título para Google"
          placeholder="Ej. Nova Forza Gym | Entrenamiento Pro"
        />
        <AdminFormTextarea
          name="seo_description"
          label="Resumen informativo (Meta Description)"
          rows={3}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <AdminFormField
            name="seo_keywords"
            label="Palabras clave (comas)"
            placeholder="gimnasio, pesas, yoga..."
          />
          <AdminFormField
            name="seo_canonical_url"
            label="URL Canónica"
            placeholder="https://mi-gym.com"
          />
        </div>
      </div>
    </AdminSection>
  );
}
