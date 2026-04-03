import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { cn } from "@/lib/cn";

interface NFCardProps extends PropsWithChildren {
  variant?: "surface" | "muted" | "primary" | "soft";
  className?: string;
}

export function NFCard({ children, variant = "surface", className }: NFCardProps) {
  return (
    <View
      className={cn(
        "overflow-hidden",
        variant === "surface" && "bg-white",
        variant === "muted" && "bg-nf-muted",
        variant === "primary" && "bg-nf-primary",
        variant === "soft" && "bg-nf-soft",
        className,
      )}
    >
      {children}
    </View>
  );
}
