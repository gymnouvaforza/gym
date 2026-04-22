import { X, ArrowUp, ArrowDown, Trash2, ChevronDown, Plus } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";
import AdminSurface from "@/components/admin/AdminSurface";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";
import { AdminFormCheckbox } from "@/components/admin/shared/forms/AdminFormCheckbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarketingPlanItemProps {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  isPending: boolean;
}

export function MarketingPlanItem({
  index,
  isOpen,
  onToggle,
  onMove,
  onRemove,
  isFirst,
  isLast,
  isPending,
}: MarketingPlanItemProps) {
  const { control, watch } = useFormContext();
  const plan = watch(`plans.${index}`);
  const features = useFieldArray({
    control,
    name: `plans.${index}.features`,
  });

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
                {plan?.title || `Plan ${index + 1}`}
              </span>
              {plan?.price_label && (
                <span className="text-[10px] font-bold uppercase text-[#7a7f87] tracking-widest">
                   / {plan.price_label}
                </span>
              )}
              {plan?.is_featured && (
                <Badge variant="default" className="h-5 rounded-none bg-[#d71920] text-white text-[8px] font-black uppercase tracking-widest border-none">
                  Destacado
                </Badge>
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
        <div className="space-y-8 border-t border-black/6 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <AdminFormField name={`plans.${index}.title`} label="Título del Plan" />
            <AdminFormField name={`plans.${index}.price_label`} label="Precio (Etiqueta)" placeholder="Ej. S/ 150" />
            <AdminFormField name={`plans.${index}.billing_label`} label="Ciclo (Etiqueta)" placeholder="Ej. Mensual" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AdminFormTextarea name={`plans.${index}.description`} label="Descripción Corta" rows={2} />
            <AdminFormField name={`plans.${index}.badge`} label="Badge Promocional" placeholder="Ej. Oferta" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 bg-white p-4 border border-black/5">
            <AdminFormCheckbox name={`plans.${index}.is_active`} label="Visible en la Web" />
            <AdminFormCheckbox name={`plans.${index}.is_featured`} label="Destacar este Plan (Efecto Visual)" />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">Características del Plan</p>
                <div className="h-px flex-1 mx-4 bg-black/5" />
             </div>

             <div className="grid gap-3">
               {features.fields.map((feature, featureIndex) => (
                 <div key={feature.id} className="flex items-center gap-3 bg-white p-2 border border-black/5">
                    <AdminFormCheckbox 
                       name={`plans.${index}.features.${featureIndex}.included`} 
                       label="" 
                       className="w-10 flex justify-center"
                    />
                    <AdminFormField 
                       name={`plans.${index}.features.${featureIndex}.label`} 
                       label="" 
                       placeholder="Ej. Acceso a máquinas"
                       className="flex-1"
                       inputClassName="h-10 border-none bg-transparent"
                    />
                    <Button 
                       type="button" 
                       variant="ghost" 
                       size="icon" 
                       className="h-8 w-8" 
                       onClick={() => features.remove(featureIndex)}
                    >
                       <X className="h-3 w-3" />
                    </Button>
                 </div>
               ))}
               <Button
                 type="button"
                 variant="ghost"
                 className="h-10 border border-dashed border-black/10 text-[9px] font-black uppercase tracking-widest"
                 onClick={() => features.append({ label: "", included: true })}
               >
                 <Plus className="mr-2 h-3 w-3" /> Añadir Característica
               </Button>
             </div>
          </div>
        </div>
      )}
    </AdminSurface>
  );
}
