interface DashboardEmptyStateProps {
  title: string;
  description: string;
}

export default function DashboardEmptyState({ title, description }: DashboardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-400">{description}</p>
    </div>
  );
}
