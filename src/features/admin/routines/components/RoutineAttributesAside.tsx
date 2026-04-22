import { Smartphone, Eye } from "lucide-react";
import { AdminFormSelect } from "@/components/admin/shared/forms/AdminFormSelect";
import { cn } from "@/lib/utils";

interface RoutineAttributesAsideProps {
  onTogglePreview: () => void;
  isActive: boolean;
}

export function RoutineAttributesAside({
  onTogglePreview,
  isActive,
}: RoutineAttributesAsideProps) {
  return (
    <div className="space-y-8">
      <div className="sticky top-24 space-y-8">
        <div className="space-y-6">
          <div className="bg-secondary p-6 text-white">
            <h4 className="font-display text-xl font-bold uppercase tracking-tighter">Atributos Pro</h4>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">ADN de la rutina</p>
          </div>
          
          <div className="space-y-4 border border-black/10 bg-white p-6 shadow-sm">
            <AdminFormSelect
              name="goal"
              label="Objetivo Principal"
              options={[
                { value: "Perdida de peso", label: "Perdida de peso" },
                { value: "Hipertrofia", label: "Hipertrofia" },
                { value: "Fuerza", label: "Fuerza" },
                { value: "Acondicionamiento", label: "Acondicionamiento" },
                { value: "Salud / Movilidad", label: "Salud / Movilidad" },
              ]}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <AdminFormSelect
                name="difficultyLabel"
                label="Dificultad"
                options={[
                  { value: "Principiante", label: "Principiante" },
                  { value: "Media", label: "Media" },
                  { value: "Avanzada", label: "Avanzada" },
                  { value: "Elite", label: "Elite" },
                ]}
              />
              <AdminFormSelect
                name="intensityLabel"
                label="Intensidad"
                options={[
                  { value: "Baja", label: "Baja" },
                  { value: "Moderada", label: "Moderada" },
                  { value: "Alta", label: "Alta" },
                  { value: "Muy Alta", label: "Muy Alta" },
                ]}
              />
            </div>

            <AdminFormSelect
              name="durationLabel"
              label="Duracion Sesion"
              options={[
                { value: "30 min", label: "30 min" },
                { value: "45 min", label: "45 min" },
                { value: "60 min", label: "60 min" },
                { value: "90 min", label: "90 min" },
              ]}
            />
            
            <div className="h-px bg-black/5 my-2" />
            
            <div className="bg-background p-4 border border-black/5 space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Estado App</span>
                  <div className="flex items-center gap-2">
                     <div className={cn("h-2 w-2 rounded-full", isActive ? "bg-green-500" : "bg-red-500")} />
                     <span className="text-[10px] font-black uppercase text-foreground">{isActive ? "Visible" : "Oculta"}</span>
                  </div>
               </div>
               <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Al guardar como visible, la rutina estara disponible para ser asignada.
               </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onTogglePreview}
            className="group flex w-full items-center justify-between bg-white border border-black/10 p-5 transition-all hover:border-foreground shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 group-hover:bg-secondary group-hover:text-white transition-all">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase text-foreground">Ver en Mobile</p>
                <p className="text-[10px] text-muted-foreground">Simular vista del socio</p>
              </div>
            </div>
            <Eye className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
