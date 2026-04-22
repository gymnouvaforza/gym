import { Layout } from "lucide-react";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

interface ConfigSiteIdentitySectionProps {
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

export function ConfigSiteIdentitySection({ isCollapsible, defaultOpen }: ConfigSiteIdentitySectionProps) {
  return (
    <AdminSection 
      title="Identidad del Sitio" 
      icon={Layout} 
      description="Nombre, slogan y textos base"
      isCollapsible={isCollapsible}
      defaultOpen={defaultOpen}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormField
          name="site_name"
          label="Nombre del Gimnasio"
        />
        <AdminFormField
          name="site_tagline"
          label="Slogan o frase corta"
        />
      </div>
      <AdminFormTextarea
        name="footer_text"
        label="Pie de página (Footer)"
        placeholder="Texto legal o de cierre..."
        rows={3}
      />
    </AdminSection>
  );
}
