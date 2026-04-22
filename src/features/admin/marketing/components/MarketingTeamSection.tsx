import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AdminSection } from "@/components/admin/shared/layout/AdminSection";
import { Button } from "@/components/ui/button";
import { MarketingTeamMemberItem } from "./MarketingTeamMemberItem";
import { createEmptyTeamMember } from "../services/marketing-mappers";

interface MarketingTeamSectionProps {
  isPending: boolean;
  disabledReason?: string;
}

export function MarketingTeamSection({
  isPending,
  disabledReason,
}: MarketingTeamSectionProps) {
  const { control } = useFormContext();
  const { fields, append, move, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AdminSection title="Equipo de Expertos" icon={Users} description="Gestiona los perfiles que aparecen en la sección principal">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <MarketingTeamMemberItem
            key={field.id}
            index={index}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            onMove={(direction) => move(index, index + direction)}
            onRemove={() => remove(index)}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            isPending={isPending}
            disabledReason={disabledReason}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="h-20 w-full border-2 border-dashed border-black/10 bg-[#fbfbf8]/50 font-black uppercase tracking-[0.2em] text-[#7a7f87] hover:border-[#111111] hover:bg-white"
          onClick={() => {
            append(createEmptyTeamMember(fields.length));
            setOpenIndex(fields.length);
          }}
          disabled={isPending || Boolean(disabledReason)}
        >
          <Plus className="mr-3 h-6 w-6" />
          Añadir Nuevo Entrenador
        </Button>
      </div>
    </AdminSection>
  );
}
