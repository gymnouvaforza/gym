"use client"

import * as React from "react"
import { HelpCircle, LucideIcon } from "lucide-react"
import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface NFFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  label: string
  icon?: LucideIcon
  tooltip?: string
  description?: string
}

export function NFField({
  name,
  label,
  icon: Icon,
  tooltip,
  description,
  className,
  ...props
}: NFFieldProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          <div className="flex items-center gap-2 group/label">
            {Icon && <Icon className="size-3.5 text-muted-foreground/60 transition-colors group-focus-within/label:text-[#d71920]" />}
            <FormLabel className="text-[10px] font-black uppercase tracking-wider text-[#7a7f87] group-focus-within/label:text-[#111111] transition-colors">
              {label}
            </FormLabel>
            {tooltip && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="size-3 text-muted-foreground/30 cursor-help transition-all hover:text-[#111111] hover:scale-110" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#111111] text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight max-w-[200px]">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <div className="relative group/input">
              <Input 
                {...field} 
                {...props} 
                value={field.value ?? ""}
                className="h-12 bg-black/[0.02] border-black/5 rounded-xl px-4 font-bold text-[#111111] placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-[#111111] focus-visible:bg-white transition-all duration-300 shadow-none"
              />
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-focus-within/input:border-[#111111]/5 pointer-events-none transition-all duration-300" />
            </div>
          </FormControl>
          {description && <FormDescription className="text-[10px] font-medium italic opacity-70">{description}</FormDescription>}
          <FormMessage className="text-[9px] font-black uppercase tracking-tighter text-[#d71920] mt-1.5" />
        </FormItem>
      )}
    />
  )
}
