import type { RoutineTemplateFormValues } from "@/lib/validators/gym-routines";

export function RoutineMobilePreview({ values }: { values: RoutineTemplateFormValues }) {
  return (
    <div className="sticky top-24 mx-auto w-[320px] overflow-hidden rounded-[3rem] border-[8px] border-secondary bg-white shadow-2xl">
      <div className="absolute top-0 left-1/2 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-secondary" />
      <div className="h-[600px] overflow-y-auto bg-background custom-scrollbar">
        {/* Header Mockup */}
        <div className="bg-secondary p-6 pt-10 text-white">
           <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Rutina socio</p>
           <h4 className="mt-1 font-display text-2xl font-bold leading-tight uppercase">{values.title || "Sin titulo"}</h4>
        </div>
        
        {/* Stats Mockup */}
        <div className="grid grid-cols-2 gap-px bg-black/5 border-b border-black/5">
           <div className="bg-white p-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Objetivo</p>
              <p className="mt-1 text-xs font-black text-foreground uppercase">{values.goal}</p>
           </div>
           <div className="bg-white p-4 text-center">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Dificultad</p>
              <p className="mt-1 text-xs font-black text-foreground uppercase">{values.difficultyLabel}</p>
           </div>
        </div>

        {/* Blocks Mockup */}
        <div className="p-4 space-y-4">
           {values.blocks.map((block, i) => (
             <div key={i} className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="h-px flex-1 bg-black/5" />
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{block.title || `Bloque ${i+1}`}</p>
                   <div className="h-px flex-1 bg-black/5" />
                </div>
                {block.exercises.map((ex, j) => (
                  <div key={j} className="border-l-2 border-primary bg-white p-3 shadow-sm">
                     <p className="text-[11px] font-black uppercase text-foreground">{ex.name || "Ejercicio..."}</p>
                     <p className="mt-1 text-[10px] font-medium text-muted-foreground">{ex.sets} x {ex.reps} • {String(ex.restSeconds)}s</p>
                  </div>
                ))}
             </div>
           ))}
        </div>
      </div>
      <div className="absolute bottom-2 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-black/20" />
    </div>
  );
}
