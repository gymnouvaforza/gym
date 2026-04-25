"use client";

import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { activateMembershipQrAction } from "@/app/(admin)/dashboard/membresias/actions";

interface MembershipActivateQrButtonProps {
  membershipRequestId: string;
  memberId: string;
}

export default function MembershipActivateQrButton({
  membershipRequestId,
  memberId,
}: Readonly<MembershipActivateQrButtonProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleActivate = () => {
    startTransition(async () => {
      try {
        await activateMembershipQrAction(membershipRequestId, memberId);
        toast.success("Acceso digital activado correctamente.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo activar el QR."
        );
      }
    });
  };

  return (
    <Button
      onClick={handleActivate}
      disabled={isPending}
      className="h-10 w-full rounded-none border border-emerald-600 bg-emerald-600/5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white shadow-sm"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Zap className="mr-2 h-4 w-4" />
      )}
      Activar Acceso Digital (QR)
    </Button>
  );
}
