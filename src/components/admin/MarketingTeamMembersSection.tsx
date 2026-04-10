"use client";

import { AlertCircle, ArrowDown, ArrowUp, Check, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";

import AdminSurface from "@/components/admin/AdminSurface";
import MarketingTeamImageUpload from "@/components/admin/MarketingTeamImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MarketingTeamValues } from "@/lib/validators/marketing";
import { cn } from "@/lib/utils";

interface MarketingTeamMembersSectionProps {
  form: UseFormReturn<MarketingTeamValues>;
  disabledReason?: string;
  isPending: boolean;
}

function createId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function createTeamMember() {
  return {
    id: createId(),
    name: "",
    role: "",
    bio: "",
    image_url: "",
    is_active: true,
    order: 0,
  };
}

function moveArrayItem<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function syncTeamOrders(form: UseFormReturn<MarketingTeamValues>, nextMembers: MarketingTeamValues["teamMembers"]) {
  nextMembers.forEach((_, index) => {
    form.setValue(`teamMembers.${index}.order`, index, { shouldDirty: true });
  });
}

export default function MarketingTeamMembersSection({
  form,
  disabledReason,
  isPending,
}: Readonly<MarketingTeamMembersSectionProps>) {
  const [openMembers, setOpenMembers] = useState<Record<string, boolean>>({ "0": true });

  const teamFields = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });

  const watchedTeamMembers = useWatch({ control: form.control, name: "teamMembers" }) ?? [];

  useEffect(() => {
    if (form.formState.submitCount <= 0) {
      return;
    }

    const memberIndexesToOpen = Object.keys(form.formState.errors.teamMembers ?? {})
      .map((key) => Number.parseInt(key, 10))
      .filter((index) => !Number.isNaN(index));

    if (memberIndexesToOpen.length === 0) {
      return;
    }

    queueMicrotask(() => {
      setOpenMembers((prev) => {
        let changed = false;
        const next = { ...prev };

        for (const index of memberIndexesToOpen) {
          if (!next[index]) {
            next[index] = true;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    });
  }, [form.formState.errors.teamMembers, form.formState.submitCount]);

  function toggleMember(index: number) {
    setOpenMembers((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  function handleMoveMember(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= watchedTeamMembers.length) {
      return;
    }

    const nextMembers = moveArrayItem(watchedTeamMembers, index, nextIndex);
    teamFields.move(index, nextIndex);
    syncTeamOrders(form, nextMembers);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          {form.formState.errors.teamMembers?.message && (
            <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {String(form.formState.errors.teamMembers.message)}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending || Boolean(disabledReason)}
          onClick={() =>
            teamFields.append({ ...createTeamMember(), order: watchedTeamMembers.length })
          }
        >
          <Plus className="h-4 w-4" />
          Anadir entrenador
        </Button>
      </div>

      <div className="space-y-4">
        {teamFields.fields.map((field, index) => {
          const isOpen = openMembers[index] ?? false;
          const memberValue = watchedTeamMembers[index];
          const hasError = Boolean(form.formState.errors.teamMembers?.[index]);

          return (
            <AdminSurface
              key={field.id}
              inset
              className={cn(
                "overflow-hidden border bg-[#fbfbf8]",
                hasError ? "border-red-200" : "border-black/8",
              )}
            >
              <div
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-black/2",
                  !isOpen && "bg-[#fcfcfa]",
                  hasError && !isOpen && "bg-red-50/30",
                )}
                onClick={() => toggleMember(index)}
              >
                <div className="flex flex-1 items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center border text-xs font-bold",
                      hasError
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-black/8 bg-white text-[#111111]",
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-sm font-semibold",
                          hasError ? "text-red-700" : "text-[#111111]",
                        )}
                      >
                        {memberValue?.name || `Entrenador ${index + 1}`}
                      </span>
                      {memberValue?.role ? (
                        <span className="text-xs text-[#5f6368]">{memberValue.role}</span>
                      ) : null}
                      {hasError ? (
                        <Badge
                          variant="default"
                          className="h-5 rounded-none border-red-200 bg-red-50 px-2 py-0 text-[8px] font-black uppercase tracking-widest text-red-700"
                        >
                          ERROR
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          memberValue?.is_active ? "bg-emerald-500" : "bg-zinc-400",
                        )}
                      />
                      <span className="text-[10px] uppercase tracking-wider text-[#7a7f87]">
                        {memberValue?.is_active ? "Activo" : "Oculto"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                  <div className="hidden gap-1 sm:flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending || index === 0}
                      onClick={() => handleMoveMember(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isPending || index === teamFields.fields.length - 1}
                      onClick={() => handleMoveMember(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isPending || Boolean(disabledReason) || teamFields.fields.length === 1}
                    onClick={() => {
                      teamFields.remove(index);
                      syncTeamOrders(form, form.getValues("teamMembers"));
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500/70" />
                  </Button>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-[#a1a1a1] transition-transform",
                      isOpen && "rotate-180",
                      hasError && "text-red-500",
                    )}
                  />
                </div>
              </div>

              {isOpen ? (
                <div className="grid gap-5 border-t border-black/6 p-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
                  <div className="space-y-4">
                    <div className="border border-black/5 bg-white/50 p-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#7a7f87]">
                        Foto y visibilidad
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.image_url`}
                      render={({ field: imageField }) => (
                        <FormItem>
                          <FormControl>
                            <MarketingTeamImageUpload
                              memberId={watchedTeamMembers[index]?.id ?? field.id}
                              value={imageField.value ?? ""}
                              onChange={imageField.onChange}
                              disabled={isPending || Boolean(disabledReason)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.is_active`}
                      render={({ field: memberField }) => (
                        <FormItem>
                          <FormLabel>Visibilidad</FormLabel>
                          <FormControl>
                            <button
                              type="button"
                              disabled={isPending || Boolean(disabledReason)}
                              onClick={() => memberField.onChange(!memberField.value)}
                              className={cn(
                                "flex h-10 w-full items-center justify-center gap-2 border px-4 text-xs font-semibold transition",
                                memberField.value
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-600",
                              )}
                            >
                              {memberField.value ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                              {memberField.value ? "Activo en portada" : "Oculto en portada"}
                            </button>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="border border-black/5 bg-white/50 p-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#7a7f87]">
                        Perfil visible
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.name`}
                      render={({ field: memberField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Nombre</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Carlos Mendoza"
                              {...memberField}
                              className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.role`}
                      render={({ field: memberField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Especialidad</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Powerlifting & Hipertrofia"
                              {...memberField}
                              className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.bio`}
                      render={({ field: memberField, fieldState }) => (
                        <FormItem>
                          <FormLabel className={cn(fieldState.error && "text-red-500")}>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Texto corto para presentar al entrenador en la portada."
                              {...memberField}
                              className={cn(fieldState.error && "border-red-300 focus-visible:ring-red-500")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ) : null}
            </AdminSurface>
          );
        })}
      </div>
    </div>
  );
}
