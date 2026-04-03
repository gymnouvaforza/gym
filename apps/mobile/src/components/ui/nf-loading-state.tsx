import { ActivityIndicator, Text, View } from "react-native";

export function NFLoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-nf-base px-8">
      <ActivityIndicator color="#AE0011" size="small" />
      <Text className="font-sans-bold text-xs uppercase tracking-[1px] text-nf-secondary">
        {label}
      </Text>
    </View>
  );
}
