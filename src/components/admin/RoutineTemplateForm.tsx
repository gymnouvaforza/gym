"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { useFormDraft } from "@/hooks/admin/use-form-draft";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveRoutineTemplateAction } from "@/app/(admin)/dashboard/rutinas/actions";
import type { DashboardRoutineTemplateDetail } from "@/lib/data/gym-management";
import { routineTemplateFormSchema, type RoutineTemplateFormValues } from "@/lib/validators/gym-routines";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";

// Domain Specific Imports
import { 
  toRoutineFormValues, 
  buildEmptyBlock 
} from "@/features/admin/routines/services/routine-mappers";
import { RoutineToolbar } from "@/features/admin/routines/components/RoutineToolbar";
import { RoutineBlockEditor } from "@/features/admin/routines/components/RoutineBlockEditor";
import { RoutineAttributesAside } from "@/features/admin/routines/components/RoutineAttributesAside";
import { RoutineMobilePreview } from "@/features/admin/routines/components/RoutineMobilePreview";

interface RoutineTemplateFormProps {
  detail?: DashboardRoutineTemplateDetail | null;
}

export default function RoutineTemplateForm({
  detail,
}: Readonly<RoutineTemplateFormProps>) {
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RoutineTemplateFormValues>({
    resolver: zodResolver(routineTemplateFormSchema),
    defaultValues: toRoutineFormValues(detail),
  });

  const draft = useFormDraft<RoutineTemplateFormValues>({
    formKey: "routine-template",
    recordId: detail?.template.id ?? "new",
    form,
  });

  const blocks = useFieldArray({
    control: form.control,
    name: "blocks",
  });

  // Watch values for reactive preview
  const watchedValues = useWatch({ control: form.control });
  const previewValues = {
    ...toRoutineFormValues(detail),
    ...watchedValues,
  } as RoutineTemplateFormValues;

  function onSubmit(values: RoutineTemplateFormValues) {
    setFeedback(null);
    startTransition(async () => {
      try {
        await saveRoutineTemplateAction(values, detail?.template.id);
        await draft.clearDraft();
        setFeedback("Cambios guardados con exito.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Error al guardar.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Banner de Borradores */}
        {draft.hasDraft && (
          <Alert className="border-amber-200 bg-amber-50 rounded-none">
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-amber-900 uppercase">
                Tienes un borrador guardado para esta rutina.
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={draft.applyDraft} className="h-7 text-[10px] font-black uppercase">
                  Restaurar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={draft.clearDraft} className="h-7 text-[10px] font-black uppercase text-amber-700">
                  Descartar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <RoutineToolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          feedback={feedback}
          isPending={isPending}
          isDraftSaving={draft.isSaving}
          onSaveDraft={draft.saveDraft}
        />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_360px]">
           <div className="space-y-12">
              {viewMode === "editor" ? (
                <>
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                       <h2 className="font-display text-3xl font-bold uppercase tracking-tighter text-[#111111]">Estructura</h2>
                       <div className="h-px flex-1 bg-black/10" />
                    </div>
                    
                    <div className="space-y-10">
                      {blocks.fields.map((block, index) => (
                        <RoutineBlockEditor
                          key={block.id}
                          blockIndex={index}
                          onRemove={() => blocks.remove(index)}
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-20 w-full border-2 border-dashed border-black/10 bg-[#fbfbf8]/50 font-black uppercase tracking-[0.2em] text-[#4b5563] hover:border-[#111111] hover:bg-white"
                      onClick={() => blocks.append(buildEmptyBlock())}
                    >
                      <Plus className="mr-3 h-6 w-6" />
                      Anadir nuevo bloque
                    </Button>
                  </section>

                  <section className="space-y-6 border-t border-black/5 pt-12">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4b5563]">Notas de Staff y Publicacion</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <AdminFormTextarea name="summary" label="Resumen para el Socio" placeholder="Que lograra el socio..." />
                      <AdminFormTextarea name="notes" label="Notas Operativas" placeholder="Instrucciones para otros coaches..." />
                    </div>
                  </section>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[600px] border-2 border-dashed border-black/5 bg-[#fbfbf8]">
                   <p className="text-sm font-bold text-[#4b5563] uppercase tracking-widest">Utiliza el panel lateral para ver el preview real</p>
                </div>
              )}
           </div>

           <aside className="space-y-8">
              {viewMode === "preview" ? (
                 <RoutineMobilePreview values={previewValues} />
              ) : (
                <RoutineAttributesAside 
                  isActive={previewValues.isActive}
                  onTogglePreview={() => setViewMode("preview")}
                />
              )}
           </aside>
        </div>
      </form>
    </Form>
  );
}
