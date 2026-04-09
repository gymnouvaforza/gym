import Link from "next/link";
import { DoorOpen } from "lucide-react";

import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import MembershipOpsSubnav from "@/components/admin/MembershipOpsSubnav";
import MembershipReceptionWorkspace from "@/components/admin/MembershipReceptionWorkspace";
import { requireAdminUser } from "@/lib/auth";

export default async function DashboardMembershipReceptionPage() {
  await requireAdminUser();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
        <DashboardPageHeader
          title="RECEPCION QR"
          description="Escaneo movil con decision binaria: el QR funciona o no funciona. La validacion vive en Supabase y el panel responde sin query strings ni fallback manual."
          eyebrow="Membership ops"
          icon={DoorOpen}
          className="pb-0"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/membresias/pedidos"
            className="flex h-12 items-center justify-center border border-black/10 bg-white px-6 text-[10px] font-black uppercase tracking-[0.18em] text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            Volver a solicitudes
          </Link>
        </div>
      </div>

      <MembershipOpsSubnav />

      <MembershipReceptionWorkspace />
    </div>
  );
}
