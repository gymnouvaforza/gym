import { Pressable, Text, View } from "react-native";

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Activity,
  Dumbbell,
  History,
  House,
  LayoutTemplate,
  ShieldCheck,
  User,
  Users,
} from "lucide-react-native";

const iconMap = {
  index: House,
  routine: Dumbbell,
  history: History,
  account: User,
  members: Users,
  templates: LayoutTemplate,
  developer: ShieldCheck,
} as const;

const labelMap = {
  index: "Inicio",
  routine: "Rutina",
  history: "Historial",
  account: "Cuenta",
  members: "Miembros",
  templates: "Plantillas",
  developer: "Developer",
} as const;

export function NFBottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row bg-white px-2">
      {state.routes.map((route, index) => {
        const routeName = route.name as keyof typeof iconMap;
        const focused = state.index === index;
        const Icon = iconMap[routeName] ?? Activity;
        const label = labelMap[routeName] ?? route.name;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            onPress={() => navigation.navigate(route.name)}
            className={`flex-1 items-center justify-center pt-3 ${
              focused ? "border-t-4 border-nf-primary" : ""
            }`}
          >
            <Icon size={18} color={focused ? "#AE0011" : "#A8A29E"} strokeWidth={2} />
            <Text
              className={`pt-1 font-sans-bold text-[10px] uppercase tracking-[1px] ${
                focused ? "text-nf-primary" : "text-nf-inactive"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
