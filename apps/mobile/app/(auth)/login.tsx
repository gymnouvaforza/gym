import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { ArrowRight } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFInput } from "@/components/ui/nf-input";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/providers/auth-provider";

const loginImage = require("../../assets/nova-login-athlete.png");

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.replace("/");
    } catch (err) {
      setError("Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-nf-base"
      >
        <View className="flex-1 justify-between px-6 pb-8 pt-6">
          <View className="gap-8">
            <Text className="font-display text-[44px] uppercase leading-[40px] tracking-tight text-nf-primary">
              Nova
            </Text>

            <View className="overflow-hidden bg-white">
              <Image source={loginImage} contentFit="cover" style={{ width: "100%", height: 264 }} />
            </View>

            <View className="gap-3">
              <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
                Acceso mobile
              </Text>
              <Text className="font-sans text-sm leading-6 text-nf-secondary">
                Entra con tu cuenta para revisar tu rutina o gestionar miembros desde el staff.
              </Text>
            </View>

            <View className="gap-5">
              <NFInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="correo@novaforza.com"
                keyboardType="email-address"
                autoComplete="email"
              />
              <NFInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {error ? (
              <NFCard variant="soft" className="border-l-4 border-nf-primary px-4 py-4">
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-primary">
                  Login error
                </Text>
                <Text className="pt-2 font-sans text-sm leading-6 text-nf-text">{error}</Text>
              </NFCard>
            ) : null}
          </View>

          <View className="gap-4">
            <NFButton loading={isSubmitting} onPress={handleSubmit} rightIcon={ArrowRight}>
              Iniciar sesión
            </NFButton>
            <Link href="/(auth)/register" asChild>
              <NFButton variant="ghost">Crear cuenta</NFButton>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
