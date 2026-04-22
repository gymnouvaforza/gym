import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface AdminFormCheckboxProps {
  name: string;
  label: string;
  className?: string;
  disabled?: boolean;
}

export function AdminFormCheckbox({
  name,
  label,
  className,
  disabled,
}: AdminFormCheckboxProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <label className="flex items-center gap-3 text-sm font-medium text-[#111111] cursor-pointer">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-[#d71920] focus:ring-[#d71920]/20"
              />
            </FormControl>
            <span className={cn(disabled && "opacity-50")}>{label}</span>
          </label>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
