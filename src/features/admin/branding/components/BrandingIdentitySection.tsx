import { Layout } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

export function BrandingIdentitySection() {
  return (
    <AdminSection 
      title="Identidad de Marca" 
      icon={Layout} 
      description="Define como se presenta tu gimnasio al mundo."
      isCollapsible
      defaultOpen={true}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <AdminFormField
          name="gym_name"
          label="Nombre del Gimnasio"
          placeholder="Nova Forza Gym"
          tooltip="Se muestra en el Sidebar, Header y correos electronicos."
        />
        <AdminFormField
          name="slogan"
          label="Eslogan"
          placeholder="Forjando Campeones"
          tooltip="Frase corta que aparece debajo del nombre o en la landing."
        />
      </div>
      <AdminFormTextarea
        name="description"
        label="Descripcion Corta"
        placeholder="Breve descripcion para SEO y redes sociales..."
        tooltip="Aparece en la meta-description de Google y previsualizaciones de enlaces."
        rows={3}
      />
    </AdminSection>
  );
}
