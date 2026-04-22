import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AdminFormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  textareaClassName?: string;
  disabled?: boolean;
}

export function AdminFormTextarea({
  name,
  label,
  placeholder,
  rows = 4,
  className,
  textareaClassName,
  disabled,
}: AdminFormTextareaProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
              className={cn(
                "rounded-none border-black/10 bg-[#fbfbf8] text-sm focus:bg-white",
                textareaClassName
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
