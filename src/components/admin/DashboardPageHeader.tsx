interface DashboardPageHeaderProps {
  title: string;
  description: string;
}

export default function DashboardPageHeader({ title, description }: DashboardPageHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#f87171]">Backoffice</p>
      <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
      <p className="max-w-3xl text-sm leading-7 text-zinc-400">{description}</p>
    </header>
  );
}
