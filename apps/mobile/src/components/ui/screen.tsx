import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

interface ScreenProps extends PropsWithChildren {
  header?: ReactNode;
  className?: string;
  contentClassName?: string;
  scroll?: boolean;
  refreshControl?: React.ComponentProps<typeof ScrollView>["refreshControl"];
}

export function Screen({
  children,
  header,
  className,
  contentClassName,
  scroll = true,
  refreshControl,
}: ScreenProps) {
  const content = (
    <View className={cn("flex-1", contentClassName)}>
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} className={cn("flex-1 bg-nf-base", className)}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 112 }}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
