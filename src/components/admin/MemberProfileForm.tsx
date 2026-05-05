"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { saveMemberProfileAction } from "@/app/(admin)/dashboard/miembros/actions";
import type {
  AuthLinkOption,
  DashboardMemberDetail,
  TrainerOption,
} from "@/lib/data/gym-management";
import { memberFormSchema, type MemberFormValues } from "@/lib/validators/gym-members";
import { useFormDraft } from "@/hooks/admin/use-form-draft";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";

// Domain Specific Imports
import { toMemberFormValues } from "@/features/admin/members/services/member-mappers";
import { MemberIdentitySection } from "@/features/admin/members/components/MemberIdentitySection";
import { MemberInternalSummarySection } from "@/features/admin/members/components/MemberInternalSummarySection";
import { MemberAuthSecurity } from "@/features/admin/members/components/MemberAuthSecurity";
import { MemberStaffAssignment } from "@/features/admin/members/components/MemberStaffAssignment";
import { MemberManagementTips } from "@/features/admin/members/components/MemberManagementTips";

interface MemberProfileFormProps {
  authOptions: AuthLinkOption[];
  detail?: DashboardMemberDetail | null;
  trainerOptions: TrainerOption[];
}

export default function MemberProfileForm({
  authOptions,
  detail,
  trainerOptions,
}: Readonly<MemberProfileFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: toMemberFormValues(detail),
  });

  const draft = useFormDraft<MemberFormValues>({
    formKey: "member-profile",
    recordId: detail?.member.id ?? "new",
    form,
  });

  function onSubmit(values: MemberFormValues) {
    startTransition(async () => {
      try {
        await saveMemberProfileAction(values, detail?.member.id);
        await draft.clearDraft();

        if (!detail) {
          toast.success("Socio registrado oficialmente.");
          router.push("/dashboard/miembros");
          router.refresh();
        } else {
          toast.success("Ficha actualizada con éxito.");
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al procesar la ficha.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* Banner de Borradores */}
        {draft.hasDraft && (
          <Alert className="border-amber-200 bg-amber-50 shadow-sm">
            <RotateCcw className="h-4 w-4 text-amber-600 animate-in spin-in-180 duration-500" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                Recuperación: Tienes cambios sin guardar de una sesión previa.
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={draft.applyDraft} className="h-7 border-amber-200 text-[9px] font-black uppercase tracking-wider bg-white hover:bg-amber-100">
                  Restaurar
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={draft.clearDraft} className="h-7 text-[9px] font-black uppercase tracking-wider text-amber-700">
                  Descartar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_360px]">
          {/* COLUMNA PRINCIPAL */}
          <div className="space-y-10">
            <MemberIdentitySection />
            <MemberInternalSummarySection />
          </div>

          {/* COLUMNA LATERAL */}
          <aside className="space-y-8">
            <div className="sticky top-24 space-y-8">
              <MemberAuthSecurity authOptions={authOptions} />
              <MemberStaffAssignment trainerOptions={trainerOptions} />
              <MemberManagementTips />
            </div>
          </aside>
        </div>

        {/* ACCIONES DE FORMULARIO */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-t border-black/5 pt-10">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={draft.isSaving || isPending}
              onClick={() => {
                draft.saveDraft();
                toast.info("Borrador guardado localmente.");
              }}
              className="h-14 px-8 border-black/10 font-black uppercase tracking-[0.2em] text-[#7a7f87] hover:bg-black/5 transition-all"
            >
              {draft.isSaving ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {draft.isSaving ? "Guardando..." : "Guardar borrador"}
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || draft.isSaving}
              className={cn(
                "h-14 px-12 text-white font-black uppercase tracking-[0.25em] transition-all duration-500 shadow-xl",
                isPending ? "bg-[#7a7f87] cursor-not-allowed" : "bg-[#111111] hover:bg-[#d71920] shadow-black/10 hover:shadow-red-500/20"
              )}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 animate-spin" />
                  <span>Sincronizando...</span>
                </div>
              ) : (
                detail ? "Actualizar Registro" : "Registrar Socio"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
