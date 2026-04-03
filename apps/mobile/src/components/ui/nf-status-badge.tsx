import { Text, View } from "react-native";

import type { MemberStatus } from "@mobile-contracts";

export function NFStatusBadge({ status }: { status: MemberStatus }) {
  const palette =
    status === "active"
      ? { bg: "bg-nf-primary", text: "text-white" }
      : status === "paused"
        ? { bg: "bg-[#C56A1A]", text: "text-white" }
        : status === "prospect"
          ? { bg: "bg-[#00588F]", text: "text-white" }
          : { bg: "bg-nf-muted", text: "text-nf-text" };

  return (
    <View className={`self-start px-3 py-1 ${palette.bg}`}>
      <Text className={`font-sans-bold text-[10px] uppercase tracking-[1px] ${palette.text}`}>
        {status}
      </Text>
    </View>
  );
}
