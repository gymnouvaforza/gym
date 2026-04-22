import { GripVertical, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface RoutineExerciseItemProps {
  blockIndex: number;
  exerciseIndex: number;
  onRemove: () => void;
  canMoveUp: boolean;
  onMoveUp: () => void;
}

export function RoutineExerciseItem({
  blockIndex,
  exerciseIndex,
  onRemove,
  canMoveUp,
  onMoveUp,
}: RoutineExerciseItemProps) {
  const { control } = useFormContext();
  const baseName = `blocks.${blockIndex}.exercises.${exerciseIndex}`;

  return (
    <div className="relative flex flex-col gap-4 border border-black/5 bg-[#fbfbf8]/50 p-6 transition-all hover:bg-white hover:shadow-xl xl:flex-row xl:items-start">
      <div className="flex shrink-0 items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center border-2 border-[#111111] text-xs font-black">
          {exerciseIndex + 1}
        </span>
      </div>

      <div className="flex-1 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminFormField
            name={`${baseName}.name`}
            label="Nombre"
            placeholder="Ej. Prensa de Piernas"
            className="xl:col-span-2"
            inputClassName="font-bold uppercase tracking-tight"
          />
          <AdminFormField
            name={`${baseName}.sets`}
            label="Series"
            placeholder="4"
            inputClassName="text-center font-bold"
          />
          <AdminFormField
            name={`${baseName}.reps`}
            label="Reps"
            placeholder="12-15"
            inputClassName="text-center font-bold"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[140px_1fr]">
          <FormField
            control={control}
            name={`${baseName}.restSeconds`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-bold uppercase text-[#4b5563]">
                  Descanso
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      step={15}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      className="pr-8 text-center font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#4b5563]">
                      S
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <AdminFormField
            name={`${baseName}.notes`}
            label="Nota Tecnica (RPE, Tempo, etc)"
            placeholder="Ej. Controlar la excentrica 3s..."
            inputClassName="bg-transparent"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 xl:flex-col">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-black/5"
          onClick={onMoveUp}
          disabled={!canMoveUp}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-[#4b5563] hover:bg-[#d71920]/5 hover:text-[#d71920]"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
