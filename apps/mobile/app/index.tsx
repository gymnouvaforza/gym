import { Redirect } from "expo-router";

import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { useAuth } from "@/providers/auth-provider";

export default function AppIndex() {
  const { isHydrated, isProfileLoading, session, role } = useAuth();

  if (!isHydrated || (session && isProfileLoading)) {
    return <NFLoadingState label="Preparando app..." />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === "staff") {
    return <Redirect href="/(staff)" />;
  }

  return <Redirect href="/(member)" />;
}
