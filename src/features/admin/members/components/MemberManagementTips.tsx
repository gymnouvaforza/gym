import { Lightbulb } from "lucide-react";

export function MemberManagementTips() {
  return (
    <div className="rounded-lg border border-[#d71920]/10 bg-[#d71920]/[0.02] p-6 space-y-4">
      <div className="flex items-center gap-2 text-[#d71920]">
        <Lightbulb className="h-4 w-4" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#111111]">Consejos de Gestión</h4>
      </div>
      <ul className="space-y-2 text-[11px] text-[#5f6368] leading-tight">
        <li>• Vincula una cuenta <span className="font-bold">Firebase</span> para habilitar el acceso a la App móvil.</li>
        <li>• Revisa la pestaña de <span className="font-bold">Finanzas</span> para registrar abonos y renovaciones.</li>
        <li>• El seguimiento de perímetros en <span className="font-bold">Progreso</span> ayuda a fidelizar al socio.</li>
      </ul>
    </div>
  );
}
