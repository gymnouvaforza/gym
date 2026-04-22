import { useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminFormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  tooltip?: string;
  rows?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function AdminFormTextarea({
  name,
  label,
  placeholder,
  tooltip,
  rows = 4,
  className,
  inputClassName,
  disabled,
}: AdminFormTextareaProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center gap-2">
            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
              {label}
            </FormLabel>
            {tooltip && (
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Info className="size-3 text-muted-foreground/40 cursor-help transition-all hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-secondary text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight max-w-[200px]">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              value={field.value ?? ""}
              className={cn(
                "min-h-[120px] border-black/10 focus:ring-1 focus:ring-[#d71920]/20",
                inputClassName
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
