import { Redirect, Tabs } from "expo-router";

import { NFBottomTabBar } from "@/components/ui/nf-bottom-tab-bar";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { useAuth } from "@/providers/auth-provider";

export default function StaffLayout() {
  const { isHydrated, isProfileLoading, session, role } = useAuth();

  if (!isHydrated || (session && isProfileLoading)) {
    return <NFLoadingState label="Cargando staff..." />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role !== "staff") {
    return <Redirect href="/(member)" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NFBottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="members" options={{ title: "Members" }} />
      <Tabs.Screen name="templates" options={{ title: "Templates" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
