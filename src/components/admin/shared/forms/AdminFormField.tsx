import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AdminFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function AdminFormField({
  name,
  label,
  placeholder,
  type = "text",
  className,
  inputClassName,
  disabled,
}: AdminFormFieldProps) {
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
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={field.value ?? ""}
              className={cn(
                "h-12 border-black/10 focus:ring-1 focus:ring-[#d71920]/20",
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
