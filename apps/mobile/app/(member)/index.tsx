import { Pressable, Text, View } from "react-native";

import { router } from "expo-router";
import { CalendarRange, Dumbbell, LifeBuoy, UserRoundX } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFSectionTitle } from "@/components/ui/nf-section-title";
import { NFStatusBadge } from "@/components/ui/nf-status-badge";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/providers/auth-provider";

export default function MemberHomeScreen() {
  const { mobileSession, profileError } = useAuth();
  const member = mobileSession?.member;
  const hasActiveRoutine = mobileSession?.hasActiveRoutine === true;

  if (!member) {
    return (
      <Screen header={<NFTopBar title="NOVA FORZA" />} contentClassName="gap-6 px-6 py-6">
        <NFEmptyState
          icon={UserRoundX}
          title="Perfil no disponible"
          description={
            profileError
              ? `No pudimos sincronizar tu perfil: ${profileError}`
              : "Tu acceso existe, pero no encontramos tu perfil de socio. Escribenos y lo revisamos."
          }
          actionLabel="Ir a soporte"
          onActionPress={() => router.push("/(member)/account")}
        />
      </Screen>
    );
  }

  return (
    <Screen header={<NFTopBar title="NOVA FORZA" />} contentClassName="gap-6 px-6 py-6">
      <View className="gap-1">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          Hola, {mobileSession.displayName}
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          Revisa tu estado, rutina activa y accesos rápidos.
        </Text>
      </View>

      <View className="gap-4">
        <NFSectionTitle title="Tu ficha" />
        <NFCard className="gap-4 bg-white px-6 py-6">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Nro
              </Text>
              <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
                {member.memberNumber}
              </Text>
            </View>
            <NFStatusBadge status={member.status} />
          </View>
          <View className="gap-1">
            <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
              Plan
            </Text>
            <Text className="font-sans-black text-base uppercase tracking-[1px] text-nf-text">
              {member.planLabel}
            </Text>
          </View>
          {member.nextActionLabel && (
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Próxima acción
              </Text>
              <Text className="font-sans text-sm leading-6 text-nf-text">
                {member.nextActionLabel}
              </Text>
            </View>
          )}
        </NFCard>
      </View>

      {hasActiveRoutine && member.currentRoutineTitle && (
        <View className="gap-4">
          <NFSectionTitle title="Entrenamiento" />
          <NFCard className="gap-3 border-l-4 border-nf-primary bg-white px-6 py-6">
            <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
              Tu rutina activa
            </Text>
            <Text className="font-display-bold text-[22px] uppercase leading-[22px] tracking-tight text-nf-text italic">
              {member.currentRoutineTitle}
            </Text>
            <NFButton
              variant="muted"
              rightIcon={Dumbbell}
              onPress={() => router.push("/(member)/routine")}
            >
              Abrir rutina
            </NFButton>
          </NFCard>
        </View>
      )}

      {member.status === "active" && !hasActiveRoutine && (
        <View className="gap-3">
          <NFCard className="gap-2 bg-white px-6 py-5">
            <Text className="font-sans-bold text-xs uppercase tracking-wider text-nf-text">
              Sin rutina asignada
            </Text>
            <Text className="font-sans text-sm leading-6 text-nf-secondary">
              Pasa por recepcion o escribenos para que tu coach te arme un plan.
            </Text>
          </NFCard>
        </View>
      )}

      <View className="gap-4">
        <NFSectionTitle title="Accesos rápidos" />
        <View className="flex-row gap-4">
          <Pressable onPress={() => router.push("/(member)/history")} className="flex-1">
            {({ pressed }) => (
              <NFCard className={`min-h-[120px] items-center justify-center bg-nf-base p-6 ${pressed ? "opacity-80" : ""}`}>
                <CalendarRange size={22} color="#1A1C19" strokeWidth={2.1} />
                <Text className="mt-3 font-sans-black text-xs uppercase tracking-[1.2px] text-nf-text">
                  Historial
                </Text>
                <Text className="mt-1 text-center font-sans text-xs text-nf-secondary">
                  Sesiones completadas
                </Text>
              </NFCard>
            )}
          </Pressable>
          <Pressable onPress={() => router.push("/(member)/account")} className="flex-1">
            {({ pressed }) => (
              <NFCard className={`min-h-[120px] items-center justify-center bg-nf-base p-6 ${pressed ? "opacity-80" : ""}`}>
                <LifeBuoy size={22} color="#1A1C19" strokeWidth={2.1} />
                <Text className="mt-3 font-sans-black text-xs uppercase tracking-[1.2px] text-nf-text">
                  Soporte
                </Text>
                <Text className="mt-1 text-center font-sans text-xs text-nf-secondary">
                  Cuenta y ayuda
                </Text>
              </NFCard>
            )}
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
