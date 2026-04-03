import type { ComponentType } from "react";
import { Text } from "react-native";

import type { LucideProps } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";

interface NFEmptyStateProps {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function NFEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: NFEmptyStateProps) {
  return (
    <NFCard className="items-center gap-4 bg-white px-8 py-10">
      <Icon size={36} color="#AE0011" strokeWidth={2.1} />
      <Text className="text-center font-display text-[28px] uppercase leading-[30px] tracking-tight text-nf-text">
        {title}
      </Text>
      <Text className="text-center font-sans text-sm leading-6 text-nf-secondary">
        {description}
      </Text>
      {actionLabel ? <NFButton onPress={onActionPress}>{actionLabel}</NFButton> : null}
    </NFCard>
  );
}
