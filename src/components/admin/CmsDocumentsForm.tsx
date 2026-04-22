"use client";

import type { DBCmsDocument } from "@/lib/supabase/database.types";
import { CmsDocumentCard } from "@/features/admin/cms/components/CmsDocumentCard";

interface CmsDocumentsFormProps {
  documents: DBCmsDocument[];
  disabledReason?: string;
}

export default function CmsDocumentsForm({
  documents,
  disabledReason,
}: Readonly<CmsDocumentsFormProps>) {
  const legalDocuments = documents.filter((doc) => doc.kind === "legal");
  const systemDocuments = documents.filter((doc) => doc.kind === "system");

  return (
    <div className="space-y-16">
      {/* SECCIÓN LEGAL */}
      <section className="space-y-6">
        <div className="px-1 border-l-4 border-[#d71920] pl-6">
          <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#111111]">
            Documentación Legal
          </h2>
          <p className="mt-1 text-sm font-medium text-[#7a7f87] uppercase tracking-tighter">
            Páginas públicas de cumplimiento, privacidad y términos de servicio.
          </p>
        </div>
        <div className="grid gap-8">
          {legalDocuments.map((doc) => (
            <CmsDocumentCard
              key={doc.key}
              document={doc}
              disabledReason={disabledReason}
            />
          ))}
        </div>
      </section>

      {/* SECCIÓN SISTEMA */}
      <section className="space-y-6">
        <div className="px-1 border-l-4 border-black pl-6">
          <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#111111]">
            Textos de Sistema
          </h2>
          <p className="mt-1 text-sm font-medium text-[#7a7f87] uppercase tracking-tighter">
            Copys reutilizables para errores, cookies y estados de la aplicación.
          </p>
        </div>
        <div className="grid gap-8">
          {systemDocuments.map((doc) => (
            <CmsDocumentCard
              key={doc.key}
              document={doc}
              disabledReason={disabledReason}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
