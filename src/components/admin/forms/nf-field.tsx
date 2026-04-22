"use client";

import { ReactNode } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldValues, Path, ControllerRenderProps } from "react-hook-form";

interface NfFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  placeholder?: string;
  type?: string;
  children: (props: { field: ControllerRenderProps<T, Path<T>> }) => ReactNode;
}

export function NfField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  children,
}: NfFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
            {label}
          </FormLabel>
          <FormControl>{children({ field })}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage className="text-[10px] font-bold uppercase" />
        </FormItem>
      )}
    />
  );
}
