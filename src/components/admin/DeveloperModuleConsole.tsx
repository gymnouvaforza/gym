"use client";

import { Info, Loader2, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toggleModuleAction } from "@/lib/data/modules.actions";
import type { SystemModuleRow } from "@/lib/module-flags";
import { cn } from "@/lib/utils";

type ModuleUpdate = {
  name: SystemModuleRow["name"];
  is_enabled: boolean;
};

interface DeveloperModuleConsoleProps {
  modules: SystemModuleRow[];
  canManage?: boolean;
}

function applyModuleUpdate(modules: SystemModuleRow[], update: ModuleUpdate) {
  return modules.map((module) =>
    module.name === update.name
      ? {
          ...module,
          is_enabled: update.is_enabled,
        }
      : module,
  );
}

export default function DeveloperModuleConsole({
  modules: initialModules,
  canManage = true,
}: Readonly<DeveloperModuleConsoleProps>) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [isPending, startTransition] = useTransition();
  const [pendingModuleName, setPendingModuleName] = useState<string | null>(null);
  const [recentlyChangedModuleName, setRecentlyChangedModuleName] = useState<string | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const [optimisticModules, setOptimisticModules] = useOptimistic(
    modules,
    (currentModules, update: ModuleUpdate) => applyModuleUpdate(currentModules, update),
  );

  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  const triggerModuleFlash = (moduleName: string) => {
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }

    setRecentlyChangedModuleName(moduleName);
    flashTimeoutRef.current = window.setTimeout(() => {
      setRecentlyChangedModuleName((currentName) =>
        currentName === moduleName ? null : currentName,
      );
      flashTimeoutRef.current = null;
    }, 1400);
  };

  const handleToggle = (module: SystemModuleRow) => {
    const nextEnabled = !module.is_enabled;

    startTransition(async () => {
      setPendingModuleName(module.name);
      triggerModuleFlash(module.name);
      setOptimisticModules({
        name: module.name,
        is_enabled: nextEnabled,
      });

      const result = await toggleModuleAction(module.name, nextEnabled);

      if (!result.success) {
        toast.error(result.error ?? "No se pudo actualizar el modulo.");
        setPendingModuleName(null);
        setRecentlyChangedModuleName(null);
        router.refresh();
        return;
      }

      setModules((currentModules) =>
        applyModuleUpdate(currentModules, {
          name: module.name,
          is_enabled: nextEnabled,
        }),
      );
      toast.success(
        nextEnabled
          ? `${module.label} activado correctamente.`
          : `${module.label} desactivado correctamente.`,
      );
      setPendingModuleName(null);
      router.refresh();
    });
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div className="grid gap-5 lg:grid-cols-2">
        {optimisticModules.map((module) => {
          const isModulePending = isPending && pendingModuleName === module.name;
          const isModuleHighlighted = recentlyChangedModuleName === module.name;

          return (
            <section
              key={module.name}
              className={cn(
                "relative overflow-hidden border border-black/10 bg-white shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-500 ease-out",
                isModuleHighlighted && "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-[0.99]",
                isModulePending && "scale-[1.01]",
                module.is_enabled ? "border-l-4 border-l-[#d71920]" : "border-l-4 border-l-[#111111]",
                module.is_enabled
                  ? "shadow-[0_22px_70px_-44px_rgba(215,25,32,0.45)]"
                  : "shadow-[0_18px_50px_-42px_rgba(17,17,17,0.28)]",
                isModuleHighlighted && (
                  module.is_enabled
                    ? "bg-[linear-gradient(135deg,rgba(215,25,32,0.06),rgba(255,255,255,0.98),rgba(17,17,17,0.04))] shadow-[0_28px_80px_-42px_rgba(215,25,32,0.55)]"
                    : "bg-[linear-gradient(135deg,rgba(17,17,17,0.06),rgba(255,255,255,0.98),rgba(17,17,17,0.03))] shadow-[0_24px_70px_-40px_rgba(17,17,17,0.35)]"
                ),
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
                  isModuleHighlighted && "opacity-100",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0",
                    module.is_enabled
                      ? "bg-[radial-gradient(circle_at_top_right,rgba(215,25,32,0.18),transparent_45%)]"
                      : "bg-[radial-gradient(circle_at_top_right,rgba(17,17,17,0.14),transparent_42%)]",
                  )}
                />
              </div>
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#d71920] via-[#111111] to-[#d71920]" />
              <div className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#7a7f87]">
                        Kernel Module
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 text-black/40 transition hover:border-[#d71920]/30 hover:text-[#d71920]"
                          >
                            <Info className="h-3.5 w-3.5" />
                            <span className="sr-only">Impacto del modulo</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[240px] border-none bg-[#111111] p-3 text-[10px] font-bold uppercase tracking-tight text-white"
                        >
                          {module.disabledImpact}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <h3 className="font-display text-3xl font-black uppercase italic tracking-tight text-[#111111]">
                      {module.label}
                    </h3>
                    <p className="max-w-lg text-sm font-medium leading-relaxed text-[#5f6368]">
                      {module.description}
                    </p>
                    {!canManage ? (
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                        Solo lectura para admin
                      </p>
                    ) : null}
                  </div>
                  <Switch
                    checked={module.is_enabled}
                    disabled={isModulePending || !canManage}
                    aria-label={`Alternar modulo ${module.label}`}
                    onCheckedChange={() => handleToggle(module)}
                    className={cn(
                      isModuleHighlighted && "motion-safe:scale-105",
                      isModulePending && "shadow-[0_0_0_6px_rgba(215,25,32,0.10)]",
                    )}
                  />
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        module.is_enabled ? "text-green-600" : "text-[#d71920]",
                        isModuleHighlighted && "motion-safe:scale-110",
                      )}
                    />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">
                      {module.is_enabled ? "Activo" : "Desactivado"}
                    </p>
                    {isModuleHighlighted ? (
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] animate-in fade-in zoom-in-95 duration-300",
                          module.is_enabled
                            ? "bg-[#d71920]/10 text-[#d71920]"
                            : "bg-[#111111]/8 text-[#111111]",
                        )}
                      >
                        <Sparkles className="h-3 w-3" />
                        {isModulePending ? "Aplicando" : "Actualizado"}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a7f87]">
                    {isModulePending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d71920]" /> : null}
                    <p>{isModulePending ? "Sincronizando..." : module.name}</p>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
