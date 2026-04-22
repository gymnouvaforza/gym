import { Layout, Eye, Save as SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoutineToolbarProps {
  viewMode: "editor" | "preview";
  setViewMode: (mode: "editor" | "preview") => void;
  feedback: string | null;
  isPending: boolean;
  isDraftSaving: boolean;
  onSaveDraft: () => void;
}

export function RoutineToolbar({
  viewMode,
  setViewMode,
  feedback,
  isPending,
  isDraftSaving,
  onSaveDraft,
}: RoutineToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-background p-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-2 rounded-none border border-black/10 p-1 bg-white">
        <button
          type="button"
          onClick={() => setViewMode("editor")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
            viewMode === "editor" ? "bg-secondary text-white" : "text-[#4b5563] hover:bg-black/5"
          )}
        >
          <Layout className="h-3 w-3" />
          Constructor
        </button>
        <button
          type="button"
          onClick={() => setViewMode("preview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
            viewMode === "preview" ? "bg-secondary text-white" : "text-[#4b5563] hover:bg-black/5"
          )}
        >
          <Eye className="h-3 w-3" />
          Vista Previa
        </button>
      </div>

      <div className="flex items-center gap-4">
        {feedback && (
          <p className="text-[10px] font-bold uppercase text-primary animate-pulse">
            {feedback}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDraftSaving || isPending}
            onClick={onSaveDraft}
            className="h-10 px-4 border-black/10 font-bold uppercase tracking-widest text-muted-foreground hover:bg-black/5"
          >
            <SaveIcon className="mr-2 h-4 w-4" />
            {isDraftSaving ? "Guardando..." : "Borrador"}
          </Button>
          <Button
            type="submit"
            disabled={isPending || isDraftSaving}
            className="bg-secondary h-10 px-8 font-black uppercase tracking-widest hover:bg-primary"
          >
            {isPending ? "Guardando..." : "Guardar Rutina"}
          </Button>
        </div>
      </div>
    </div>
  );
}
