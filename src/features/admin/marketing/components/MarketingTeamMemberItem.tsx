import { Check, X, ArrowUp, ArrowDown, Trash2, ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import AdminSurface from "@/components/admin/AdminSurface";
import { AdminFormField } from "@/components/admin/shared/forms/AdminFormField";
import { AdminFormTextarea } from "@/components/admin/shared/forms/AdminFormTextarea";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import MarketingTeamImageUpload from "@/components/admin/MarketingTeamImageUpload";
import { cn } from "@/lib/utils";

interface MarketingTeamMemberItemProps {
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  isPending: boolean;
  disabledReason?: string;
}

export function MarketingTeamMemberItem({
  index,
  isOpen,
  onToggle,
  onMove,
  onRemove,
  isFirst,
  isLast,
  isPending,
  disabledReason,
}: MarketingTeamMemberItemProps) {
  const { control, watch } = useFormContext();
  const member = watch(`teamMembers.${index}`);

  return (
    <AdminSurface
      inset
      className={cn(
        "overflow-hidden border bg-[#fbfbf8]",
        isOpen ? "border-black/20 shadow-md" : "border-black/8",
      )}
    >
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-black/2",
          !isOpen && "bg-[#fcfcfa]",
        )}
        onClick={onToggle}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/8 bg-white text-xs font-bold text-[#111111]">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-black uppercase tracking-tight text-[#111111]">
                {member?.name || `Entrenador ${index + 1}`}
              </span>
              {member?.role && (
                <span className="text-[10px] font-bold uppercase text-[#7a7f87] tracking-widest">
                   / {member.role}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className={cn("h-1.5 w-1.5 rounded-full", member?.is_active ? "bg-emerald-500" : "bg-zinc-400")} />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#7a7f87]">
                {member?.is_active ? "Activo" : "Oculto"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="hidden gap-1 sm:flex">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isPending || isFirst}
              onClick={() => onMove(-1)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isPending || isLast}
              onClick={() => onMove(1)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isPending || Boolean(disabledReason)}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 text-[#d71920]/70" />
          </Button>
          <ChevronDown className={cn("h-5 w-5 text-[#a1a1a1] transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      {isOpen && (
        <div className="grid gap-8 border-t border-black/6 p-6 lg:grid-cols-[240px_1fr]">
          <div className="space-y-6">
            <FormField
              control={control}
              name={`teamMembers.${index}.image_url`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MarketingTeamImageUpload
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      disabled={isPending || Boolean(disabledReason)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-white border border-black/5 p-4 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7a7f87]">Estado en Portada</p>
              <FormField
                control={control}
                name={`teamMembers.${index}.is_active`}
                render={({ field }) => (
                  <button
                    type="button"
                    disabled={isPending || Boolean(disabledReason)}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "flex h-10 w-full items-center justify-center gap-2 border px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                      field.value
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-zinc-200 bg-zinc-50 text-zinc-600",
                    )}
                  >
                    {field.value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {field.value ? "Visible" : "Oculto"}
                  </button>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AdminFormField
                name={`teamMembers.${index}.name`}
                label="Nombre Público"
                placeholder="Ej. Carlos Mendoza"
              />
              <AdminFormField
                name={`teamMembers.${index}.role`}
                label="Especialidad / Cargo"
                placeholder="Ej. Coach Powerlifting"
              />
            </div>
            <AdminFormTextarea
              name={`teamMembers.${index}.bio`}
              label="Biografía Corta"
              placeholder="Resume su experiencia y enfoque..."
              rows={4}
            />
          </div>
        </div>
      )}
    </AdminSurface>
  );
}
