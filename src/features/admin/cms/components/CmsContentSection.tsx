import { FileText } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

interface CmsContentSectionProps {
  kind: "legal" | "system";
  originalSlug: string;
}

export function CmsContentSection({ kind, originalSlug }: CmsContentSectionProps) {
  const { watch } = useFormContext();
  const watchedSlug = watch("slug");

  return (
    <AdminSection title="Contenido Principal" icon={FileText}>
      <div className="grid gap-5 md:grid-cols-2">
        <AdminFormField
          name="title"
          label="Título del Documento"
          placeholder="Ej. Política de Privacidad"
        />
        <div className="space-y-2">
          <AdminFormField
            name="slug"
            label="Slug (URL)"
          />
          <p className="text-[10px] font-bold text-[#5f6368] uppercase px-1">
            {kind === "legal"
              ? `Ruta pública: /${watchedSlug || originalSlug}`
              : "Identificador interno para sistema."}
          </p>
        </div>
      </div>

      <AdminFormTextarea
        name="summary"
        label="Resumen / Extracto"
        placeholder="Breve descripción del propósito de este documento..."
        rows={2}
      />

      <div className="space-y-2">
        <AdminFormTextarea
          name="body_markdown"
          label="Contenido (Markdown)"
          placeholder="Escribe aquí el contenido usando sintaxis Markdown..."
          rows={8}
          textareaClassName="font-mono text-sm"
        />
        <p className="text-[10px] font-bold text-[#7a7f87] uppercase px-1">
          Soporta: # Títulos, - Listas, **Negrita**.
        </p>
      </div>
    </AdminSection>
  );
}
