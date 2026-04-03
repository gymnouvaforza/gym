import { Text, View } from "react-native";

import { LayoutTemplate } from "lucide-react-native";

import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useRoutineTemplatesQuery } from "@/hooks/use-mobile-queries";

export default function StaffTemplatesScreen() {
  const templatesQuery = useRoutineTemplatesQuery();

  if (templatesQuery.isLoading) {
    return <NFLoadingState label="Cargando plantillas..." />;
  }

  const items = templatesQuery.data ?? [];

  if (items.length === 0) {
    return (
      <Screen header={<NFTopBar title="Plantillas" />} contentClassName="gap-6 px-6 py-6">
        <NFEmptyState
          icon={LayoutTemplate}
          title="Sin plantillas"
          description="Todavía no hay plantillas listas para asignar."
        />
      </Screen>
    );
  }

  return (
    <Screen header={<NFTopBar title="Plantillas" />} contentClassName="gap-4 px-6 py-6">
      {items.map((template) => (
        <NFCard key={template.id} className="gap-4 bg-white px-6 py-6">
          <View className="gap-2">
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
            <Text className="font-sans text-sm leading-6 text-nf-secondary">{template.summary}</Text>
          </View>

          <View className="flex-row flex-wrap gap-4">
            <View className="min-w-[120px] gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Duración
              </Text>
              <Text className="font-sans text-sm text-nf-text">{template.durationLabel}</Text>
            </View>
            <View className="min-w-[120px] gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Intensidad
              </Text>
              <Text className="font-sans text-sm text-nf-text">{template.intensityLabel}</Text>
            </View>
            <View className="min-w-[120px] gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Coach
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {template.trainerName ?? "Sin entrenador"}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4">
            <View className="min-w-[120px] gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Estructura
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {template.blockCount} bloques
              </Text>
            </View>
            <View className="min-w-[120px] gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Ejercicios
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {template.exerciseCount} cargados
              </Text>
            </View>
          </View>
        </NFCard>
      ))}
    </Screen>
  );
}
