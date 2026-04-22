import { ArrowUp, ArrowDown, Trash2, ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import AdminSurface from "@/components/admin/AdminSurface";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarketingScheduleItemProps {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  isPending: boolean;
}

export function MarketingScheduleItem({
  index,
  isOpen,
  onToggle,
  onMove,
  onRemove,
  isFirst,
  isLast,
  isPending,
}: MarketingScheduleItemProps) {
  const { watch } = useFormContext();
  const row = watch(`scheduleRows.${index}`);

  return (
    <AdminSurface
      inset
      className={cn(
        "overflow-hidden border bg-[#fbfbf8]",
        isOpen ? "border-black/20 shadow-md" : "border-black/8",
      )}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-black/2",
          !isOpen && "bg-[#fcfcfa]",
        )}
        onClick={onToggle}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/8 bg-white text-xs font-bold text-[#111111]">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-black uppercase tracking-tight text-[#111111]">
                {row?.label || `Horario ${index + 1}`}
              </span>
              {row?.opens_at && row?.closes_at && (
                <span className="text-[10px] font-bold uppercase text-[#7a7f87] tracking-widest">
                   / {row.opens_at} - {row.closes_at}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="hidden gap-1 sm:flex">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={isPending || isFirst} onClick={() => onMove(-1)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={isPending || isLast} onClick={() => onMove(1)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={isPending} onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-[#d71920]/70" />
          </Button>
          <ChevronDown className={cn("h-5 w-5 text-[#a1a1a1] transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="space-y-6 border-t border-black/6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AdminFormField name={`scheduleRows.${index}.label`} label="Etiqueta del Horario" placeholder="Ej. Lunes a Viernes" />
            <AdminFormField name={`scheduleRows.${index}.description`} label="Subtítulo / Nota" placeholder="Ej. Horario continuo" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AdminFormField name={`scheduleRows.${index}.opens_at`} label="Apertura" placeholder="06:00" />
            <AdminFormField name={`scheduleRows.${index}.closes_at`} label="Cierre" placeholder="22:00" />
          </div>

          <div className="bg-white p-4 border border-black/5">
            <AdminFormCheckbox name={`scheduleRows.${index}.is_active`} label="Mostrar este horario en la web" />
          </div>
        </div>
      )}
    </AdminSurface>
  );
}
