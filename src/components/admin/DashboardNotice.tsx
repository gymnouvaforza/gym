export default function DashboardNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      {message}
    </div>
  );
}
