import AdminSurface from "./AdminSurface";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function DashboardEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: DashboardEmptyStateProps) {
  return (
    <AdminSurface inset className="border-dashed px-6 py-10 text-center shadow-none">
      <p className="text-lg font-semibold text-[#111111]">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5f6368]">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild variant="outline" className="mt-6">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </AdminSurface>
  );
}
