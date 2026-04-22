import { Image as ImageIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import NFImageUploader from "@/components/admin/shared/NFImageUploader";

export function BrandingVisualsSection() {
  const { watch, setValue } = useFormContext();
  
  const logoUrl = watch("logo_url");
  const faviconUrl = watch("favicon_url");

  return (
    <AdminSection 
      title="Recursos Visuales" 
      icon={ImageIcon} 
      description="Logo y Favicon oficiales de la marca."
      isCollapsible
      defaultOpen={true}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <NFImageUploader
          label="Logo Principal"
          scope="branding"
          value={logoUrl}
          onChange={(url) => setValue("logo_url", url, { shouldDirty: true })}
          tooltip="Dimensiones recomendadas: 512x512px. PNG con fondo transparente preferiblemente."
          aspectRatio="square"
        />
        <NFImageUploader
          label="Favicon (Icono Web)"
          scope="favicon"
          value={faviconUrl}
          onChange={(url) => setValue("favicon_url", url, { shouldDirty: true })}
          tooltip="Dimensiones recomendadas: 32x32px o 64x64px. Formato ICO o PNG."
          aspectRatio="square"
          className="max-w-[200px]"
        />
      </div>
    </AdminSection>
  );
}
