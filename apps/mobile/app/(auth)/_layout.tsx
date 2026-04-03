import { Redirect, Stack } from "expo-router";

import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { useAuth } from "@/providers/auth-provider";

export default function AuthLayout() {
  const { isHydrated, session, isProfileLoading } = useAuth();

  if (!isHydrated) {
    return <NFLoadingState label="Cargando acceso..." />;
  }

  if (session) {
    if (isProfileLoading) {
      return <NFLoadingState label="Cargando perfil..." />;
    }

    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
