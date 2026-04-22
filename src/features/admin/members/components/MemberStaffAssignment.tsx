"use client";

import { UserCog, HelpCircle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { NFCard } from "@/components/system/nf-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TrainerOption } from "@/lib/data/gym-management";

interface MemberStaffAssignmentProps {
  trainerOptions: TrainerOption[];
}

export function MemberStaffAssignment({ trainerOptions }: Readonly<MemberStaffAssignmentProps>) {
  const { control } = useFormContext();

  return (
    <NFCard 
      title="Staff a Cargo" 
      description="Supervisión técnica del socio."
      className="bg-white border-black/5 shadow-xl shadow-black/[0.02]"
    >
      <FormField
        control={control}
        name="trainerUserId"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <div className="flex items-center gap-2 group/label">
              <UserCog className="size-3.5 text-muted-foreground/60 transition-colors group-focus-within/label:text-[#d71920]" />
              <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87] group-focus-within/label:text-[#111111] transition-colors">
                Coach Responsable
              </FormLabel>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3 text-muted-foreground/30 cursor-help transition-all hover:text-[#111111] hover:scale-110" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#111111] text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight max-w-[220px]">
                    Selecciona al entrenador encargado de personalizar y seguir las rutinas de este socio.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select onValueChange={field.onChange} value={field.value ?? "none"}>
              <FormControl>
                <SelectTrigger className="h-12 bg-black/[0.02] border-black/5 rounded-xl px-4 font-bold text-[#111111] focus:ring-0 focus:border-[#111111] transition-all">
                  <SelectValue placeholder="Sin coach asignado (Club)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl border-black/5 shadow-2xl z-[100]">
                <SelectItem value="none" className="text-xs font-bold uppercase py-3 text-muted-foreground">Sin coach asignado (Club)</SelectItem>
                {trainerOptions.map((opt) => (
                  <SelectItem key={opt.userId} value={opt.userId} className="text-xs font-bold uppercase py-3">
                    {opt.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] font-medium italic opacity-70 text-[#5f6368]">
               Asignación interna para reportes de desempeño por coach.
            </p>
            <FormMessage className="text-[9px] font-black uppercase text-[#d71920]" />
          </FormItem>
        )}
      />
    </NFCard>
  );
}
