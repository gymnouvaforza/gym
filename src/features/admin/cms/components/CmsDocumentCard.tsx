"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, FileWarning, Loader2, Save, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { saveCmsDocument } from "@/app/(admin)/dashboard/actions";
import AdminSurface from "@/components/admin/AdminSurface";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { DBCmsDocument } from "@/lib/supabase/database.types";
import { cmsDocumentSchema, type CmsDocumentValues } from "@/lib/validators/cms-document";

// Domain & Shared
import { toCmsFormValues } from "../services/cms-mappers";
import { CmsContentSection } from "./CmsContentSection";
import { CmsCtaSection } from "./CmsCtaSection";
import { CmsSeoSection } from "./CmsSeoSection";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";

interface CmsDocumentCardProps {
  document: DBCmsDocument;
  disabledReason?: string;
}

export function CmsDocumentCard({ document, disabledReason }: CmsDocumentCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CmsDocumentValues>({
    resolver: zodResolver(cmsDocumentSchema),
    defaultValues: toCmsFormValues(document),
  });

  function onSubmit(values: CmsDocumentValues) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await saveCmsDocument(values);
        setFeedback("Documento actualizado con éxito.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Error al guardar.");
      }
    });
  }

  const previewHref = document.kind === "legal" ? `/${document.slug}` : document.cta_href ?? "/";

  return (
    <AdminSurface className="space-y-8 border border-black/8 bg-[#fbfbf8] p-8 shadow-sm">
      {/* Header Informativo */}
      <div className="flex flex-col gap-4 border-b border-black/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920]">
            ID: {document.key}
          </p>
          <h3 className="text-2xl font-black uppercase tracking-tighter text-[#111111]">
            {document.title}
          </h3>
          <p className="max-w-2xl text-xs font-medium leading-relaxed text-[#5f6368] uppercase tracking-wide">
            {document.kind === "legal"
              ? "Documento público con URL propia, SEO y CTA opcional."
              : "Texto de sistema reutilizable para flujos técnicos y estados de error."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#111111]">
            {document.kind === "legal" ? <ShieldCheck className="h-3.5 w-3.5 text-[#d71920]" /> : <FileWarning className="h-3.5 w-3.5" />}
            {document.kind === "legal" ? "Contenido Legal" : "Texto de Sistema"}
          </div>
          <Button asChild variant="outline" className="h-10 px-4 font-bold uppercase tracking-widest text-[10px] border-black/10">
            <Link href={previewHref} target={document.kind === "legal" ? undefined : "_blank"}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Vista Previa
            </Link>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          <CmsContentSection kind={document.kind as "legal" | "system"} originalSlug={document.slug} />
          <CmsCtaSection />
          <CmsSeoSection />

          <div className="flex flex-col gap-6 border-t border-black/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <AdminFormCheckbox 
              name="is_published" 
              label="Publicado y visible en la plataforma" 
              className="bg-white p-4 border border-black/5"
            />
            
            <div className="flex items-center gap-4">
              {feedback && (
                <p className="text-[10px] font-black uppercase text-[#d71920] animate-pulse">
                  {feedback}
                </p>
              )}
              <Button 
                type="submit" 
                disabled={isPending || Boolean(disabledReason)}
                className="h-12 px-8 bg-[#111111] text-white font-black uppercase tracking-widest hover:bg-[#d71920]"
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Actualizar Documento
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </AdminSurface>
  );
}
