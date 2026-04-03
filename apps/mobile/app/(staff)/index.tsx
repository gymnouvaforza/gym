import type { PropsWithChildren } from "react";
import { Pressable, RefreshControl, Text, View } from "react-native";

import { CircleAlert, LayoutTemplate, Search, ShieldCheck } from "lucide-react-native";

import { router } from "expo-router";

import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFSectionTitle } from "@/components/ui/nf-section-title";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useStaffDashboardQuery } from "@/hooks/use-mobile-queries";

function ActionCard({
  children,
  onPress,
}: PropsWithChildren<{ onPress: () => void }>) {
  return (
    <View style={{ flex: 1 }}>
      <Pressable onPress={onPress} className="flex-1">
        {({ pressed }) => (
          <NFCard className={`bg-nf-base p-5 ${pressed ? "opacity-80" : ""}`}>
            {children}
          </NFCard>
        )}
      </Pressable>
    </View>
  );
}

export default function StaffHomeScreen() {
  const dashboardQuery = useStaffDashboardQuery();
  const dashboard = dashboardQuery.data;

  if (dashboardQuery.isLoading && !dashboard) {
    return <NFLoadingState label="Cargando dashboard..." />;
  }

  if (dashboardQuery.isError) {
    return (
      <Screen header={<NFTopBar title="STAFF" />} contentClassName="gap-6 px-6 py-6">
        <NFEmptyState
          icon={CircleAlert}
          title="No pudimos cargar el dashboard"
          description="Revisa tu conexión y volve a intentar."
          actionLabel="Reintentar"
          onActionPress={() => void dashboardQuery.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={<NFTopBar title="STAFF" />}
      contentClassName="gap-6 px-6 py-6"
      refreshControl={
        <RefreshControl
          refreshing={dashboardQuery.isFetching}
          onRefresh={() => void dashboardQuery.refetch()}
          colors={["#AE0011"]}
        />
      }
    >
      <View className="gap-1">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          Operacion del dia
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          Vista compacta de miembros activos, asignaciones pendientes y actividad reciente.
        </Text>
      </View>

      {dashboard && (
        <>
          <View className="gap-4">
            <View className="flex-row gap-4">
              <View style={{ flex: 1 }}>
                <View className="gap-1 rounded-lg bg-nf-primary px-5 py-5">
                  <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-white/80">
                    Miembros activos
                  </Text>
                  <Text className="font-display text-[36px] leading-[36px] tracking-tight text-white">
                    {dashboard.activeMembers}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View className="gap-1 rounded-lg bg-white px-5 py-5">
                  <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                    Pendientes
                  </Text>
                  <Text className="font-display text-[36px] leading-[36px] tracking-tight text-nf-text">
                    {dashboard.pendingAssignments}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-4">
            <NFSectionTitle title="Acciones rápidas" />
            <View className="flex-row gap-4">
              <ActionCard onPress={() => router.push("/(staff)/members")}>
                <Search size={20} color="#1A1C19" strokeWidth={2} />
                <Text className="mt-3 font-sans-bold text-sm uppercase tracking-[1px] text-nf-text">
                  Buscar miembro
                </Text>
                <Text className="mt-1 font-sans text-xs text-nf-secondary">
                  Consulta rápida y acceso a ficha
                </Text>
              </ActionCard>
              <ActionCard onPress={() => router.push("/(staff)/templates")}>
                <LayoutTemplate size={20} color="#1A1C19" strokeWidth={2} />
                <Text className="mt-3 font-sans-bold text-sm uppercase tracking-[1px] text-nf-text">
                  Ver plantillas
                </Text>
                <Text className="mt-1 font-sans text-xs text-nf-secondary">
                  Biblioteca de rutinas
                </Text>
              </ActionCard>
            </View>
          </View>

          {dashboard.recentActivity.length > 0 ? (
            <View className="gap-4">
              <NFSectionTitle title="Actividad reciente" />
              {dashboard.recentActivity.map((activity) => (
                <NFCard key={activity.id} className="gap-2 bg-white px-6 py-5">
                  <View className="flex-row items-center justify-between gap-4">
                    <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
                      {activity.memberName}
                    </Text>
                    <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-primary">
                      {activity.accentLabel}
                    </Text>
                  </View>
                  <Text className="font-sans text-sm leading-6 text-nf-secondary">
                    {activity.description}
                  </Text>
                </NFCard>
              ))}
            </View>
          ) : (
            <NFEmptyState
              icon={CircleAlert}
              title="Sin actividad hoy"
              description="Aun no hay movimientos recientes para mostrar."
            />
          )}

          <NFCard className="gap-3 bg-white px-6 py-6">
            <View className="flex-row items-center gap-3">
              <ShieldCheck size={18} color="#AE0011" strokeWidth={2.2} />
              <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
                Estado del sistema
              </Text>
            </View>
            <Text className="font-sans text-sm leading-6 text-nf-secondary">
              {dashboard.systemStatus}
            </Text>
          </NFCard>
        </>
      )}
    </Screen>
  );
}
