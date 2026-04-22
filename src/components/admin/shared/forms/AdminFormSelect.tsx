import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface AdminFormSelectProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
}

export function AdminFormSelect({
  name,
  label,
  options,
  className,
  selectClassName,
  disabled,
}: AdminFormSelectProps) {
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
            <select
              {...field}
              disabled={disabled}
              className={cn(
                "flex h-11 w-full border border-black/10 bg-white px-3 text-xs font-black uppercase text-[#111111] outline-none focus:ring-1 focus:ring-[#d71920]/20",
                selectClassName
              )}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
