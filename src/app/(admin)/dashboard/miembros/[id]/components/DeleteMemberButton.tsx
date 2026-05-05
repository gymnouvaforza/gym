"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { archiveMemberAction } from "@/app/(admin)/dashboard/miembros/actions";

interface DeleteMemberButtonProps {
  memberId: string;
  memberName: string;
}

export default function DeleteMemberButton({ memberId, memberName }: DeleteMemberButtonProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  async function handleArchive() {
    const confirmed = window.confirm(
      `¿Estas seguro de que deseas archivar la ficha de "${memberName}"?\n\nEsta accion archivara la ficha y conservara el historial de pagos, membresias y asistencias. El socio pasara a estado "Ex-socio" y ya no aparecera en el listado activo.`
    );

    if (!confirmed) return;

    const secondConfirmed = window.confirm(
      `Confirmacion final: ¿archivar "${memberName}"?\n\nEsta accion no elimina datos, pero el socio quedara oculto del listado activo.`
    );

    if (!secondConfirmed) return;

    setIsArchiving(true);
    try {
      const result = await archiveMemberAction(memberId);
      if (result.success) {
        toast.success("Ficha archivada correctamente.");
        router.push("/dashboard/miembros");
        router.refresh();
      } else {
        toast.error(result.error ?? "No se pudo archivar la ficha.");
      }
    } catch {
      toast.error("Error inesperado al archivar la ficha.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <Button
      variant="outline"
      disabled={isArchiving}
      onClick={handleArchive}
      className="h-12 px-6 font-black uppercase text-[10px] tracking-widest border-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 transition-all"
    >
      {isArchiving ? "Archivando..." : "Archivar Ficha"}
    </Button>
  );
}
