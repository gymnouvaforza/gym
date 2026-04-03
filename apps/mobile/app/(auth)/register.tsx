import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { Link, router } from "expo-router";
import { ArrowRight } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFInput } from "@/components/ui/nf-input";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const result = await signUp(email.trim(), password);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailVerification) {
      setMessage("Revisa tu correo para confirmar la cuenta antes de entrar.");
      return;
    }

    router.replace("/");
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-nf-base"
      >
        <View className="flex-1 justify-between px-6 pb-8 pt-8">
          <View className="gap-8">
            <View className="gap-3">
              <Text className="font-display text-[40px] uppercase leading-[38px] tracking-tight text-nf-text">
                Crear cuenta
              </Text>
              <Text className="font-sans text-sm leading-6 text-nf-secondary">
                Usa tu correo personal para activar el acceso mobile y vincular tu ficha cuando esté lista.
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
                placeholder="Minimo 8 caracteres"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            {message ? (
              <NFCard variant="soft" className="border-l-4 border-[#00588F] px-4 py-4">
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-[#00588F]">
                  Estado
                </Text>
                <Text className="pt-2 font-sans text-sm leading-6 text-nf-text">{message}</Text>
              </NFCard>
            ) : null}

            {error ? (
              <NFCard variant="soft" className="border-l-4 border-nf-primary px-4 py-4">
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-primary">
                  Error de registro
                </Text>
                <Text className="pt-2 font-sans text-sm leading-6 text-nf-text">{error}</Text>
              </NFCard>
            ) : null}
          </View>

          <View className="gap-4">
            <NFButton loading={isSubmitting} onPress={handleSubmit} rightIcon={ArrowRight}>
              Crear acceso
            </NFButton>
            <Link href="/(auth)/login" asChild>
              <NFButton variant="ghost">Volver a login</NFButton>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
