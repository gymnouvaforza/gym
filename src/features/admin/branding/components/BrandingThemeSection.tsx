import { Palette } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export function BrandingThemeSection() {
  const { control } = useFormContext();

  return (
    <AdminSection 
      title="Colores de Marca" 
      icon={Palette} 
      description="Personaliza los colores globales de la interfaz."
      isCollapsible
      defaultOpen={true}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <FormField
          control={control}
          name="primary_color"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2 mb-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
                  Color Primario (Accion)
                </FormLabel>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-muted-foreground/40 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-secondary text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight">
                      Usado para botones principales, enlaces y estados activos.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <div className="flex gap-3">
                  <Input 
                    type="color" 
                    {...field} 
                    className="w-16 h-12 p-1 cursor-pointer border-black/10" 
                  />
                  <Input 
                    {...field} 
                    placeholder="#d71920" 
                    className="flex-1 font-mono uppercase border-black/10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="secondary_color"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2 mb-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
                  Color Secundario (Contraste)
                </FormLabel>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-muted-foreground/40 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-secondary text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight">
                      Usado para el Sidebar, Footer y paneles de contraste.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <div className="flex gap-3">
                  <Input 
                    type="color" 
                    {...field} 
                    className="w-16 h-12 p-1 cursor-pointer border-black/10" 
                  />
                  <Input 
                    {...field} 
                    placeholder="#111111" 
                    className="flex-1 font-mono uppercase border-black/10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </AdminSection>
  );
}
