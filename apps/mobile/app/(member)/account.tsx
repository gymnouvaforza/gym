import { useState } from "react";
import { Text, View } from "react-native";

import { LifeBuoy, LogOut, UserRoundX } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFSectionTitle } from "@/components/ui/nf-section-title";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { formatShortDate } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

export default function MemberAccountScreen() {
  const { mobileSession, profileError, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const member = mobileSession?.member;

  async function handleSignOut() {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <Screen header={<NFTopBar title="Cuenta" />} contentClassName="gap-6 px-6 py-6">
      <View className="gap-3">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          {mobileSession?.displayName ?? "Nova Forza"}
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          Gestiona tu acceso, revisa el estado de tu ficha y encuentra un canal rápido de soporte.
        </Text>
      </View>

      {member ? (
        <View className="gap-4">
          <NFSectionTitle title="Ficha" />
          <NFCard className="gap-4 bg-white px-6 py-6">
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Email
              </Text>
              <Text className="font-sans text-sm text-nf-text">{mobileSession?.email}</Text>
            </View>
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Plan
              </Text>
              <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
                {member.planLabel}
              </Text>
            </View>
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Alta
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {formatShortDate(member.joinDate)}
              </Text>
            </View>
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Sede
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {member.branchName ?? "Por confirmar"}
              </Text>
            </View>
          </NFCard>
        </View>
      ) : (
        <NFEmptyState
          icon={UserRoundX}
          title="Perfil pendiente de revisión"
          description={
            profileError
              ? `No pudimos sincronizar tu perfil mobile: ${profileError}`
              : "Tu acceso ya esta activo, pero no pudimos recuperar tu perfil de miembro. Escribenos y lo revisamos contigo."
          }
        />
      )}

      <View className="gap-4">
        <NFSectionTitle title="Soporte" />
        <NFCard className="gap-3 bg-white px-6 py-6">
          <View className="flex-row items-center gap-3">
            <LifeBuoy size={18} color="#AE0011" strokeWidth={2.2} />
            <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
              Contacto directo
            </Text>
          </View>
          <Text className="font-sans text-sm leading-6 text-nf-secondary">
            Si necesitas activar tu ficha, resolver acceso o pedir una rutina, usa soporte@novaforza.com.
          </Text>
        </NFCard>
      </View>

      <NFButton
        variant="ghost"
        onPress={handleSignOut}
        loading={isLoggingOut}
        disabled={isLoggingOut}
        rightIcon={LogOut}
      >
        Cerrar sesión
      </NFButton>
    </Screen>
  );
}
