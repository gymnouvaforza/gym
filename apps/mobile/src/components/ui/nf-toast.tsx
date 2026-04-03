import { Text, View } from "react-native";

import { CheckCircle2 } from "lucide-react-native";

export function NFToast({ message }: { message: string }) {
  return (
    <View className="mx-6 mb-4 flex-row items-center gap-3 bg-white px-4 py-4">
      <CheckCircle2 size={20} color="#AE0011" strokeWidth={2.1} />
      <Text className="flex-1 font-sans text-sm text-nf-text">{message}</Text>
    </View>
  );
}
