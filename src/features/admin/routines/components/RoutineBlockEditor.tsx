import { Trash2, Plus } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";
import { Button } from "@/components/ui/button";
import { RoutineExerciseItem } from "./RoutineExerciseItem";
import { buildEmptyExercise } from "../services/routine-mappers";

interface RoutineBlockEditorProps {
  blockIndex: number;
  onRemove: () => void;
}

export function RoutineBlockEditor({
  blockIndex,
  onRemove,
}: RoutineBlockEditorProps) {
  const { control } = useFormContext();
  const exercises = useFieldArray({
    control,
    name: `blocks.${blockIndex}.exercises`,
  });

  return (
    <div className="group relative space-y-6 border border-black/10 bg-white p-8 transition-all hover:border-primary/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 pb-6">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-secondary font-display text-xl font-bold text-white">
            {String(blockIndex + 1).padStart(2, "0")}
          </div>
          <AdminFormField
            name={`blocks.${blockIndex}.title`}
            label=""
            placeholder="TITULO DEL BLOQUE"
            className="flex-1 min-w-[240px]"
            inputClassName="h-10 border-none bg-transparent p-0 text-2xl font-black uppercase tracking-tight shadow-none focus-visible:ring-0 placeholder:text-black/10"
          />
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={onRemove} 
          className="h-10 text-muted-foreground hover:bg-primary/5 hover:text-primary font-bold uppercase tracking-wider text-[10px]"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Quitar bloque
        </Button>
      </div>

      <AdminFormTextarea
        name={`blocks.${blockIndex}.description`}
        label="Instrucciones estrategicas"
        placeholder="Enfoque de la sesion, tempos generales o material necesario..."
        rows={2}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Ejercicios ({exercises.fields.length})</p>
           <div className="h-px flex-1 mx-4 bg-black/5" />
        </div>
        
        <div className="grid gap-4">
          {exercises.fields.map((exercise, exerciseIndex) => (
            <RoutineExerciseItem
              key={exercise.id}
              blockIndex={blockIndex}
              exerciseIndex={exerciseIndex}
              onRemove={() => exercises.remove(exerciseIndex)}
              canMoveUp={exerciseIndex > 0}
              onMoveUp={() => exercises.move(exerciseIndex, exerciseIndex - 1)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-2 border-dashed border-black/10 py-8 font-black uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          onClick={() => exercises.append(buildEmptyExercise())}
        >
          <Plus className="mr-2 h-5 w-5" />
          Anadir ejercicio
        </Button>
      </div>
    </div>
  );
}
