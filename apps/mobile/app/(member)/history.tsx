import { RefreshControl, Text, View } from "react-native";

import { router } from "expo-router";
import { AlertTriangle, ArrowLeft, FolderArchive, UserRoundX } from "lucide-react-native";

import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useMemberHistoryQuery } from "@/hooks/use-mobile-queries";
import { formatShortDateTime } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

export default function MemberHistoryScreen() {
  const { mobileSession } = useAuth();
  const historyQuery = useMemberHistoryQuery();
  const { isFetching } = historyQuery;

  const refreshControl = (
    <RefreshControl
      refreshing={isFetching}
      onRefresh={historyQuery.refetch}
      tintColor="#AE0011"
    />
  );

  if (historyQuery.isLoading) {
    return <NFLoadingState label="Cargando historial..." />;
  }

  if (!mobileSession?.member) {
    return (
      <Screen
        header={<NFTopBar title="Historial" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
        refreshControl={refreshControl}
      >
        <NFEmptyState
          icon={UserRoundX}
          title="Perfil no disponible"
          description="No pudimos recuperar tu perfil de miembro para mostrar el historial de entrenamiento."
        />
      </Screen>
    );
  }

  if (historyQuery.isError) {
    const errorMessage = historyQuery.error instanceof Error
      ? historyQuery.error.message
      : "Error desconocido al cargar el historial.";

    return (
      <Screen
        header={<NFTopBar title="Historial" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
        refreshControl={refreshControl}
      >
        <NFEmptyState
          icon={AlertTriangle}
          title="No pudimos cargar el historial"
          description={errorMessage}
          actionLabel="Reintentar"
          onActionPress={() => historyQuery.refetch()}
        />
      </Screen>
    );
  }

  const items = historyQuery.data?.items ?? [];

  if (items.length === 0) {
    return (
      <Screen
        header={<NFTopBar title="Historial" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
        refreshControl={refreshControl}
      >
        <NFEmptyState
          icon={FolderArchive}
          title="Sin sesiones archivadas"
          description="Todavía no completaste ninguna sesión. Una vez que avances en tu rutina, tu progreso aparecerá aquí."
          actionLabel="Ir a mi rutina"
          onActionPress={() => router.push("/routine")}
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={<NFTopBar title="Historial" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
      contentClassName="gap-4 px-6 py-6"
      refreshControl={refreshControl}
    >
      {items.map((item) => (
        <NFCard key={item.id} className="gap-3 bg-white px-6 py-6">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
                {item.title}
              </Text>
              <Text className="font-sans text-sm text-nf-secondary">
                {formatShortDateTime(item.completedAt)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                {item.metricLabel}
              </Text>
              <Text className="font-display text-[36px] leading-[36px] tracking-tight text-nf-primary">
                {item.metricValue}
              </Text>
            </View>
          </View>
        </NFCard>
      ))}
    </Screen>
  );
}
