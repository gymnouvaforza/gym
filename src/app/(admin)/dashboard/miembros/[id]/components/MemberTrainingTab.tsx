"use client";

import { motion } from "framer-motion";
import AdminSurface from "@/components/admin/AdminSurface";
import AssignRoutinePanel from "@/components/admin/AssignRoutinePanel";
import { TrainingFeedbackDto, RoutineAssignmentDto, RoutineTemplateListItemDto } from "@mobile-contracts";
import { Calendar, Dumbbell, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MemberTrainingTab({
  detail,
  assignmentHistory,
  availableTemplates,
  trainingFeedback,
}: {
  detail: { id: string; fullName: string; [key: string]: unknown };
  assignmentHistory: RoutineAssignmentDto[];
  availableTemplates: RoutineTemplateListItemDto[];
  trainingFeedback: TrainingFeedbackDto;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      <AssignRoutinePanel
        memberId={detail.id}
        templates={availableTemplates}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feedback Section */}
        {trainingFeedback.exercises.length > 0 ? (
          <AdminSurface className="p-6 border-black/5 h-full">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-6 flex items-center gap-2">
              <div className="w-1 h-3 bg-[#d71920]" />
              Feedback del Socio (Rutina Actual)
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {trainingFeedback.exercises.map((f, idx) => (
                <div key={idx} className="p-4 bg-[#fbfbf8] border border-black/5 hover:border-black/10 transition-colors rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] font-black uppercase text-[#111111] tracking-tight">{f.exerciseName}</span>
                    <Badge variant={f.liked ? 'success' : 'warning'} className="text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tighter">
                      {f.liked ? 'LE GUSTA' : 'REVISAR'}
                    </Badge>
                  </div>
                  {f.note && <p className="text-xs text-[#5f6368] italic border-l-2 border-black/10 pl-3 mt-3">&quot;{f.note}&quot;</p>}
                </div>
              ))}
            </div>
          </AdminSurface>
        ) : (
          <AdminSurface className="p-12 border-black/5 flex flex-col items-center justify-center text-center bg-[#fbfbf8]/50">
            <div className="size-16 rounded-full bg-black/5 flex items-center justify-center mb-6">
              <Dumbbell className="size-8 text-[#7a7f87]" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#111111] mb-2">Sin Feedback Reciente</h3>
            <p className="text-xs text-[#7a7f87] max-w-[240px] leading-relaxed uppercase font-bold">
              El socio aún no ha calificado ejercicios de su rutina actual en la App.
            </p>
          </AdminSurface>
        )}

        {/* History Section */}
        <AdminSurface className="p-6 border-black/5 h-full">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111] mb-6 flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-[#7a7f87]" />
            Historial de Asignaciones
          </h3>
          <div className="space-y-3">
            {assignmentHistory.length > 0 ? (
              assignmentHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-black/5 bg-white hover:bg-black/[0.01] transition-all hover:shadow-sm rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-[11px] font-black">
                      #{assignmentHistory.length - i}
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase text-[#111111] tracking-tight">{h.templateTitle}</p>
                      <p className="text-[10px] font-bold text-[#7a7f87] uppercase flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3 w-3" /> {new Date(h.assignedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="muted" className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border-emerald-100">
                    Completado
                  </Badge>
                </div>
              ))
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-black/5 rounded-2xl">
                <p className="text-[10px] font-black text-[#7a7f87] uppercase tracking-[0.2em]">Sin historial previo</p>
              </div>
            )}
          </div>
        </AdminSurface>
      </div>
    </motion.div>
  );
}
