import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";

import type { LucideProps } from "lucide-react-native";

interface NFTopBarProps {
  title?: string;
  leftIcon?: ComponentType<LucideProps>;
  rightIcon?: ComponentType<LucideProps>;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export function NFTopBar({
  title = "NOVA FORZA",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onLeftPress,
  onRightPress,
}: NFTopBarProps) {
  return (
    <View className="flex-row items-center justify-between bg-nf-base px-6 py-4">
      <Pressable
        accessibilityRole="button"
        disabled={!onLeftPress}
        onPress={onLeftPress}
        className="h-8 w-8 items-start justify-center"
      >
        {LeftIcon ? <LeftIcon size={18} color="#AE0011" strokeWidth={2.2} /> : null}
      </Pressable>

      <Text className="font-display text-2xl uppercase tracking-tight text-nf-primary">
        {title}
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={!onRightPress}
        onPress={onRightPress}
        className="h-8 w-8 items-end justify-center"
      >
        {RightIcon ? <RightIcon size={18} color="#AE0011" strokeWidth={2.1} /> : null}
      </Pressable>
    </View>
  );
}
