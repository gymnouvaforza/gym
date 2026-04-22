"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Activity, Dumbbell, Eye, ShieldCheck, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { deleteMemberAction } from "@/app/(admin)/dashboard/miembros/actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmDialog } from "@/features/admin/components/shared/delete-confirm-dialog";
import type { DashboardMemberListItem } from "@/lib/data/gym-management";
import { cn } from "@/lib/utils";

interface MembersTableProps {
  initialMembers: DashboardMemberListItem[];
}

export default function MembersTable({ initialMembers }: MembersTableProps) {
  const [, startTransition] = useTransition();
  const [memberToDelete, setMemberToDelete] = useState<DashboardMemberListItem | null>(null);

  const [optimisticMembers, deleteOptimisticMember] = useOptimistic(
    initialMembers,
    (state, idToRemove: string) => state.filter((member) => member.id !== idToRemove),
  );

  function handleDeleteConfirm() {
    if (!memberToDelete) {
      return;
    }

    const id = memberToDelete.id;
    setMemberToDelete(null);

    startTransition(async () => {
      deleteOptimisticMember(id);
      try {
        await deleteMemberAction(id);
        toast.success("Socio eliminado del sistema de manera irreversible.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al eliminar la ficha del socio.",
        );
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-black/5 shadow-2xl shadow-black/[0.03] bg-white">
      <DeleteConfirmDialog
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar ficha operativa"
        description={`Esta accion no se puede deshacer. Se eliminaran datos, finanzas y rutinas asociadas a ${memberToDelete?.fullName || ""}.`}
      />

      <Table className="min-w-[800px]">
        <TableHeader className="bg-black/[0.02]">
          <TableRow className="hover:bg-transparent border-black/5">
            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111] px-6">
              <div className="flex items-center gap-2">
                <Users className="size-3 text-[#d71920]" />
                <span>Socio / Expediente</span>
              </div>
            </TableHead>
            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111]">
              <div className="flex items-center gap-2">
                <Activity className="size-3 text-[#d71920]" />
                <span>Estado Operativo</span>
              </div>
            </TableHead>
            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3 text-[#d71920]" />
                <span>Perfil Interno</span>
              </div>
            </TableHead>
            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111]">
              <div className="flex items-center gap-2">
                <Dumbbell className="size-3 text-[#d71920]" />
                <span>Carga Tecnica</span>
              </div>
            </TableHead>
            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-[#111111] text-right px-6">
              <span>Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optimisticMembers.map((member) => (
            <TableRow
              key={member.id}
              className="group hover:bg-black/[0.01] transition-all duration-300 border-black/[0.03]"
            >
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-11 shrink-0 rounded-2xl border border-black/5 bg-[#111111] flex items-center justify-center font-black text-white text-xs shadow-lg shadow-black/10 group-hover:scale-105 transition-transform duration-500">
                    {member.fullName[0].toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/miembros/${member.id}`}
                      className="text-[13px] font-black text-[#111111] hover:text-[#d71920] transition-colors uppercase tracking-tight block mb-1"
                    >
                      {member.fullName}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-[#d71920] bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        {member.memberNumber}
                      </span>
                      <span className="text-black/10 text-[10px]">-</span>
                      <p className="text-[10px] font-bold text-[#7a7f87] lowercase opacity-60">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-5">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all duration-500",
                    member.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-100"
                      : "bg-black/[0.03] text-[#7a7f87] border-black/5 group-hover:bg-black/[0.06]",
                  )}
                >
                  <div
                    className={cn(
                      "size-1 rounded-full",
                      member.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-[#7a7f87]",
                    )}
                  />
                  {member.status}
                </div>
              </TableCell>
              <TableCell className="py-5">
                <span className="inline-flex px-2.5 py-1 bg-black/[0.03] border border-black/5 text-[9px] font-black uppercase tracking-[0.2em] text-[#7a7f87] rounded-md transition-colors group-hover:bg-white group-hover:border-black/10">
                  {member.planLabel || "SIN PLAN"}
                </span>
              </TableCell>
              <TableCell className="py-5">
                <div
                  className={cn(
                    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight transition-colors",
                    member.currentRoutineTitle ? "text-emerald-600" : "text-amber-600 animate-pulse",
                  )}
                >
                  <div
                    className={cn(
                      "size-1.5 rounded-full",
                      member.currentRoutineTitle ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  {member.currentRoutineTitle ?? "SIN ASIGNAR"}
                </div>
              </TableCell>
              <TableCell className="text-right px-6 py-5">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/miembros/${member.id}`}
                    className="inline-flex h-10 items-center rounded-xl border border-black/10 bg-white px-5 text-[10px] font-black uppercase tracking-widest text-[#111111] transition-all duration-500 hover:bg-[#111111] hover:text-white hover:border-[#111111] hover:shadow-xl hover:shadow-black/10 active:scale-95"
                  >
                    <Eye className="size-3.5 mr-2" />
                    Ver Ficha
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar socio ${member.fullName}`}
                    onClick={() => setMemberToDelete(member)}
                    className="h-10 w-10 text-[#7a7f87] hover:text-[#d71920] hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
