import { Plus, Clock } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { Button } from "@/components/ui/button";
import { MarketingScheduleItem } from "./MarketingScheduleItem";
import { createEmptyScheduleRow } from "../services/marketing-mappers";

interface MarketingScheduleSectionProps {
  isPending: boolean;
  disabledReason?: string;
}

export function MarketingScheduleSection({
  isPending,
  disabledReason,
}: MarketingScheduleSectionProps) {
  const { control } = useFormContext();
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "scheduleRows",
  });

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AdminSection title="Horarios de Apertura" icon={Clock} description="Define los bloques horarios visibles en la web">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <MarketingScheduleItem
            key={field.id}
            index={index}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            onMove={(direction) => move(index, index + direction)}
            onRemove={() => remove(index)}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            isPending={isPending}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="h-20 w-full border-2 border-dashed border-black/10 bg-[#fbfbf8]/50 font-black uppercase tracking-[0.2em] text-[#7a7f87] hover:border-[#111111] hover:bg-white"
          onClick={() => {
            append(createEmptyScheduleRow(fields.length));
            setOpenIndex(fields.length);
          }}
          disabled={isPending || Boolean(disabledReason)}
        >
          <Plus className="mr-3 h-6 w-6" />
          Añadir Nuevo Horario
        </Button>
      </div>
    </AdminSection>
  );
}
