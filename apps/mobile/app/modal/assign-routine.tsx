import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, LayoutTemplate } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";

import { AssignRoutineInputSchema, type AssignRoutineInput } from "@mobile-contracts";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFToast } from "@/components/ui/nf-toast";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useAssignRoutineMutation, useRoutineTemplatesQuery } from "@/hooks/use-mobile-queries";

export default function AssignRoutineModal() {
  const { memberId = "", memberName = "Miembro" } = useLocalSearchParams<{
    memberId?: string;
    memberName?: string;
  }>();
  const queryClient = useQueryClient();
  const templatesQuery = useRoutineTemplatesQuery();
  const assignMutation = useAssignRoutineMutation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<AssignRoutineInput>({
    resolver: zodResolver(AssignRoutineInputSchema),
    defaultValues: {
      memberId,
      templateId: "",
      notes: "",
      recommendedScheduleLabel: "",
    },
  });

  const selectedTemplateId = form.watch("templateId");

  async function handleSubmit(values: AssignRoutineInput) {
    const response = await assignMutation.mutateAsync(values);
    setToastMessage(response.message);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
      queryClient.invalidateQueries({ queryKey: ["staff-member-detail"] }),
    ]);
  }

  if (templatesQuery.isLoading) {
    return <NFLoadingState label="Cargando plantillas..." />;
  }

  const templates = templatesQuery.data ?? [];

  return (
    <Screen
      header={<NFTopBar title="Asignar" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
      contentClassName="gap-6 px-6 py-6"
    >
      <View className="gap-3">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          {memberName}
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          Selecciona una plantilla con suficiente contexto operativo antes de asignarla.
        </Text>
      </View>

      <Controller
        control={form.control}
        name="templateId"
        render={({ field, fieldState }) => (
          <View className="gap-4">
            <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
              Plantillas
            </Text>
            {templates.map((template) => {
              const selected = selectedTemplateId === template.id;

              return (
                <Pressable key={template.id} onPress={() => field.onChange(template.id)}>
                  {({ pressed }) => (
                    <NFCard
                      className={`gap-4 px-6 py-6 ${
                        selected ? "border-l-4 border-nf-primary bg-white" : "bg-white"
                      } ${pressed ? "opacity-85" : ""}`}
                    >
                      <View className="flex-row items-start justify-between gap-4">
                        <View className="flex-1 gap-2">
                          <View className="flex-row flex-wrap gap-2">
                            <Text className="bg-nf-muted px-3 py-1 font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                              {template.statusLabel}
                            </Text>
                            <Text className="bg-nf-muted px-3 py-1 font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                              {template.difficultyLabel}
                            </Text>
                          </View>
                          <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
                            {template.title}
                          </Text>
                          <Text className="font-sans text-sm leading-6 text-nf-secondary">
                            {template.summary}
                          </Text>
                        </View>
                        {selected ? (
                          <Check size={18} color="#AE0011" strokeWidth={2.2} />
                        ) : (
                          <LayoutTemplate size={18} color="#A8A29E" strokeWidth={2.2} />
                        )}
                      </View>

                      <View className="flex-row flex-wrap gap-4">
                        <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                          {template.durationLabel}
                        </Text>
                        <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                          {template.intensityLabel}
                        </Text>
                        <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                          {template.blockCount} bloques
                        </Text>
                        <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                          {template.exerciseCount} ejercicios
                        </Text>
                      </View>

                      <Text className="font-sans text-sm text-nf-secondary">
                        {template.trainerName ?? "Sin entrenador"}
                      </Text>
                    </NFCard>
                  )}
                </Pressable>
              );
            })}
            {fieldState.error ? (
              <Text className="font-sans text-sm text-nf-primary">{fieldState.error.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="recommendedScheduleLabel"
        render={({ field }) => (
          <View className="gap-2">
            <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
              Hora recomendada
            </Text>
            <TextInput
              value={field.value ?? ""}
              onChangeText={field.onChange}
              placeholder="Ej. Lun/Mié/Vie · 19:00"
              placeholderTextColor="#8B8176"
              className="bg-nf-muted px-4 py-4 font-sans text-base text-nf-text"
            />
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="notes"
        render={({ field }) => (
          <View className="gap-2">
            <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
              Notas staff
            </Text>
            <TextInput
              value={field.value ?? ""}
              onChangeText={field.onChange}
              multiline
              numberOfLines={4}
              placeholder="Carga, observaciones o foco de revisión"
              placeholderTextColor="#8B8176"
              textAlignVertical="top"
              className="min-h-[132px] bg-nf-muted px-4 py-4 font-sans text-base text-nf-text"
            />
          </View>
        )}
      />

      {toastMessage ? <NFToast message={toastMessage} /> : null}

      <View className="gap-4">
        <NFButton
          loading={assignMutation.isPending}
          onPress={form.handleSubmit(handleSubmit)}
        >
          Confirmar asignación
        </NFButton>
        <NFButton variant="ghost" onPress={() => router.back()}>
          Cerrar
        </NFButton>
      </View>
    </Screen>
  );
}
