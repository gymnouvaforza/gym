import "react-native-gesture-handler";
import "../global.css";

import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
  Epilogue_700Bold,
  Epilogue_900Black,
  useFonts as useEpilogueFonts,
} from "@expo-google-fonts/epilogue";
import {
  Inter_400Regular,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { NFCard } from "@/components/ui/nf-card";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { Screen } from "@/components/ui/screen";
import { getMobileConfigState } from "@/lib/mobile-config";
import { AuthProvider } from "@/providers/auth-provider";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const configState = getMobileConfigState();
  const [epilogueLoaded] = useEpilogueFonts({
    Epilogue_700Bold,
    Epilogue_900Black,
  });
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const fontsLoaded = epilogueLoaded && interLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <NFLoadingState label="Cargando fuentes..." />;
  }

  if (!configState.ok) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <Screen scroll={false} contentClassName="justify-center gap-6 px-6 py-6">
            <View className="gap-3">
              <Text className="font-display text-[38px] uppercase leading-[36px] tracking-tight text-nf-primary">
                Configuración pendiente
              </Text>
              <Text className="font-sans text-sm leading-6 text-nf-secondary">
                La app mobile necesita credenciales públicas de Supabase para poder iniciar sesión.
              </Text>
            </View>
            <NFCard className="gap-4 bg-white px-6 py-6">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Variables requeridas
              </Text>
              <Text className="font-sans text-sm text-nf-text">NEXT_PUBLIC_SUPABASE_URL</Text>
              <Text className="font-sans text-sm text-nf-text">NEXT_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text className="pt-2 font-sans text-sm leading-6 text-nf-secondary">
                {configState.message}
              </Text>
            </NFCard>
            <NFCard variant="soft" className="border-l-4 border-nf-primary px-6 py-5">
              <Text className="font-sans text-sm leading-6 text-nf-text">
                Reinicia Expo despues de actualizar el archivo de entorno para que la configuracion nueva se cargue en el cliente.
              </Text>
            </NFCard>
          </Screen>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAFAF5" } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(member)" />
              <Stack.Screen name="(staff)" />
              <Stack.Screen
                name="modal/assign-routine"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
