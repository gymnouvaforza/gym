import { Text, View } from "react-native";

interface NFSectionTitleProps {
  title: string;
  accentLabel?: string;
}

export function NFSectionTitle({ title, accentLabel }: NFSectionTitleProps) {
  return (
    <View className="flex-row items-end justify-between">
      <Text className="font-display-bold text-[18px] uppercase tracking-tight text-nf-text">
        {title}
      </Text>
      {accentLabel ? (
        <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-primary">
          {accentLabel}
        </Text>
      ) : null}
    </View>
  );
}
