import { notFound } from "next/navigation";

import AdminSection from "@/components/admin/AdminSection";
import AssignRoutinePanel from "@/components/admin/AssignRoutinePanel";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import MemberProfileForm from "@/components/admin/MemberProfileForm";
import AdminSurface from "@/components/admin/AdminSurface";
import {
  getDashboardMemberDetail,
  listDashboardAuthLinkOptions,
  listDashboardTrainerOptions,
} from "@/lib/data/gym-management";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Heart } from "lucide-react";

export default async function DashboardMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, authOptions, trainerOptions] = await Promise.all([
    getDashboardMemberDetail(id),
    listDashboardAuthLinkOptions(),
    listDashboardTrainerOptions(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={detail.member.fullName}
        description="Ficha operativa del miembro con plan resumido, estado real y asignacion de rutina."
        icon={ClipboardList}
        eyebrow={detail.member.memberNumber}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminSurface className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
            Estado
          </p>
          <div className="mt-3">
            <Badge variant={detail.member.status === "active" ? "success" : "muted"}>
              {detail.member.status}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-[#5f6368]">{detail.statusMeta.helperText}</p>
        </AdminSurface>
        <AdminSurface className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
            Plan actual
          </p>
          <p className="mt-3 text-lg font-semibold text-[#111111]">
            {detail.plan?.label ?? "Sin plan"}
          </p>
          <p className="mt-2 text-sm text-[#5f6368]">
            {detail.plan?.status ?? "Pendiente"} · {detail.member.branchName ?? "Sin sede"}
          </p>
        </AdminSurface>
        <AdminSurface className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
            Rutina activa
          </p>
          <p className="mt-3 text-lg font-semibold text-[#111111]">
            {detail.member.currentRoutineTitle ?? "Sin rutina"}
          </p>
          <p className="mt-2 text-sm text-[#5f6368]">
            {detail.assignmentHistory[0]?.assignedAt ?? "Sin asignacion"}
          </p>
        </AdminSurface>
      </div>

      <AdminSection title="Editar ficha" description="La edicion principal del miembro vive en dashboard.">
        <MemberProfileForm
          detail={detail}
          authOptions={authOptions}
          trainerOptions={trainerOptions}
        />
      </AdminSection>

      <AdminSection
        title="Asignacion de Carga Tecnica"
        description="Selecciona una plantilla del catalogo oficial para activarla en la App del socio. La nueva rutina sustituira a la actual."
        className="pt-10 border-t border-black/5"
      >
        <AssignRoutinePanel memberId={detail.member.id} templates={detail.availableTemplates} />
      </AdminSection>

      <AdminSection
        title="Historial de Entrenamiento"
        description="Registro cronologico de todas las plantillas asignadas a este miembro."
      >
        <div className="space-y-3">
          {detail.assignmentHistory.length ? (
            detail.assignmentHistory.map((assignment) => (
              <AdminSurface key={assignment.id} inset className="p-4 border-black/5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-black/5 flex items-center justify-center font-bold text-[#111111]">
                      {assignment.templateTitle[0]}
                    </div>
                    <div>
                      <p className="font-bold text-[#111111] uppercase tracking-tight">{assignment.templateTitle}</p>
                      <p className="mt-1 text-[10px] font-medium text-[#7a7f87] uppercase tracking-wider">
                        {assignment.assignedAt} · Coach: {assignment.trainerName ?? "Club"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={assignment.status === "active" ? "success" : "muted"} className="font-black uppercase text-[9px]">
                    {assignment.status}
                  </Badge>
                </div>
                {assignment.notes ? (
                  <div className="mt-4 p-3 bg-[#fbfbf8] border-l-2 border-black/10">
                    <p className="text-xs text-[#5f6368] leading-relaxed italic">{assignment.notes}</p>
                  </div>
                ) : null}
              </AdminSurface>
            ))
          ) : (
            <AdminSurface inset className="p-12 text-center border-dashed border-black/10 bg-[#fbfbf8]">
              <p className="text-sm font-bold text-[#7a7f87] uppercase tracking-widest">Sin historial de asignaciones.</p>
            </AdminSurface>
          )}
        </div>
      </AdminSection>

      <AdminSection
        title="Feedback de Entrenamiento"
        description="Lo que el socio esta marcando sobre la rutina activa y sus ejercicios."
      >
        {detail.trainingFeedback.routine || detail.trainingFeedback.exercises.length ? (
          <div className="space-y-4">
            <AdminSurface className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
                    Rutina actual
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#111111]">
                    {detail.member.currentRoutineTitle ?? "Sin rutina"}
                  </p>
                </div>
                <Badge variant={detail.trainingFeedback.routine?.liked ? "success" : "muted"}>
                  {detail.trainingFeedback.routine?.liked ? "Le gusta" : "Sin like"}
                </Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#5f6368]">
                {detail.trainingFeedback.routine?.note ?? "Todavia no ha dejado una nota sobre la rutina activa."}
              </p>
            </AdminSurface>

            <div className="space-y-3">
              {detail.trainingFeedback.exercises.length ? (
                detail.trainingFeedback.exercises.map((exercise) => (
                  <AdminSurface key={exercise.exerciseId} inset className="border-black/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold uppercase tracking-tight text-[#111111]">{exercise.exerciseName}</p>
                        <p className="mt-1 text-xs leading-5 text-[#5f6368]">
                          {exercise.note ?? "Sin nota del socio."}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[#d71920]">
                        <Heart
                          className={exercise.liked ? "fill-current" : ""}
                          size={16}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {exercise.liked ? "Like" : "Neutro"}
                        </span>
                      </div>
                    </div>
                  </AdminSurface>
                ))
              ) : (
                <AdminSurface inset className="border-dashed border-black/10 bg-[#fbfbf8] p-8 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#7a7f87]">
                    Sin feedback por ejercicio.
                  </p>
                </AdminSurface>
              )}
            </div>
          </div>
        ) : (
          <AdminSurface inset className="border-dashed border-black/10 bg-[#fbfbf8] p-8 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#7a7f87]">
              El socio aun no ha dejado feedback de entrenamiento.
            </p>
          </AdminSurface>
        )}
      </AdminSection>
    </div>
  );
}
