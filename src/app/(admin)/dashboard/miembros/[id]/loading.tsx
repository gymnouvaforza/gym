import AdminSurface from "@/components/admin/AdminSurface";
import DashboardPageHeader from "@/components/admin/DashboardPageHeader";
import { ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <DashboardPageHeader
        title="Cargando Socio..."
        description="..."
        icon={ClipboardList}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <AdminSurface key={i} className="p-5 h-32">
            <Skeleton className="h-3 w-20 mb-4" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </AdminSurface>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <AdminSurface className="p-6 h-64">
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2" />
        </AdminSurface>
      </div>
    </div>
  );
}
