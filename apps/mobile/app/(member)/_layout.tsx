import { Redirect, Tabs } from "expo-router";

import { NFBottomTabBar } from "@/components/ui/nf-bottom-tab-bar";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { useAuth } from "@/providers/auth-provider";

export default function MemberLayout() {
  const { isHydrated, isProfileLoading, session, role } = useAuth();

  if (!isHydrated || (session && isProfileLoading)) {
    return <NFLoadingState label="Cargando area de socio..." />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === "staff") {
    return <Redirect href="/(staff)" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NFBottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="routine" options={{ title: "Routine" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
