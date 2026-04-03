import type { ComponentType, PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { LucideProps } from "lucide-react-native";

import { cn } from "@/lib/cn";

type Variant = "primary" | "muted" | "ghost";

interface NFButtonProps extends PropsWithChildren {
  variant?: Variant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  rightIcon?: ComponentType<LucideProps>;
}

export function NFButton({
  children,
  variant = "primary",
  onPress,
  disabled,
  loading,
  className,
  textClassName,
  rightIcon: RightIcon,
}: NFButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className="min-h-16"
    >
      {({ pressed }) => (
        <View
          className={cn(
            "min-h-16 flex-row items-center justify-center border-0 px-8 py-5",
            variant === "primary" && "bg-nf-primary",
            variant === "muted" && "bg-nf-muted",
            variant === "ghost" && "border-t border-nf-line bg-transparent",
            (disabled || loading) && "opacity-60",
            pressed && !disabled && "opacity-85",
            className,
          )}
        >
          {loading ? (
            <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#1A1C19"} />
          ) : (
            <View className="flex-row items-center gap-3">
              <Text
                className={cn(
                  "font-sans-black text-base uppercase tracking-[1.6px]",
                  variant === "primary" ? "text-white" : "text-nf-text",
                  textClassName,
                )}
              >
                {children}
              </Text>
              {RightIcon ? (
                <RightIcon
                  size={16}
                  color={variant === "primary" ? "#FFFFFF" : "#AE0011"}
                  strokeWidth={2.2}
                />
              ) : null}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
