import { Text, View } from "react-native";

import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ArrowRight, CircleAlert, Heart, ImageIcon } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFSectionTitle } from "@/components/ui/nf-section-title";
import { NFStatusBadge } from "@/components/ui/nf-status-badge";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useStaffMemberDetailQuery, useUpdateStaffMemberMutation } from "@/hooks/use-mobile-queries";

const memberAvatar = require("../../../assets/nova-member-avatar.png");

export default function StaffMemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const detailQuery = useStaffMemberDetailQuery(id);
  const updateMemberMutation = useUpdateStaffMemberMutation(id);

  if (detailQuery.isLoading) {
    return <NFLoadingState label="Cargando ficha..." />;
  }

  const detail = detailQuery.data;

  async function changeStatus(nextStatus: "active" | "paused") {
    const memberId = Array.isArray(id) ? id[0] : id;

    if (!memberId) {
      return;
    }

    try {
      await updateMemberMutation.mutateAsync({ status: nextStatus });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["staff-members"] }),
        queryClient.invalidateQueries({ queryKey: ["staff-member-detail"] }),
        queryClient.invalidateQueries({ queryKey: ["staff-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["member-routine"] }),
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  if (detailQuery.isError) {
    return (
      <Screen
        header={<NFTopBar title="Ficha" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
      >
        <NFEmptyState
          icon={CircleAlert}
          title="No pudimos cargar la ficha"
          description="Revisa tu conexión y volve a intentar."
          actionLabel="Reintentar"
          onActionPress={() => void detailQuery.refetch()}
        />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen
        header={<NFTopBar title="Ficha" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
      >
        <NFEmptyState
          icon={CircleAlert}
          title="Miembro no encontrado"
          description="No encontramos una ficha con ese identificador."
        />
      </Screen>
    );
  }

  return (
    <Screen
      header={<NFTopBar title="Ficha" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
      contentClassName="gap-6 px-6 py-6"
    >
      <View className="overflow-hidden bg-white">
        <Image source={memberAvatar} contentFit="cover" style={{ width: "100%", height: 212 }} />
      </View>

      <View className="gap-3">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          {detail.member.fullName}
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">{detail.member.email}</Text>
        <NFStatusBadge status={detail.member.status} />
      </View>

      <View className="gap-4">
        <NFSectionTitle title="Resumen" />
        <NFCard className="gap-4 bg-white px-6 py-6">
          {detail.quickStats.map((item) => (
            <View key={item.id} className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                {item.label}
              </Text>
              <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
                {item.value}
              </Text>
            </View>
          ))}
        </NFCard>
      </View>

      <View className="gap-4">
        <NFSectionTitle title="Estado" />
        <NFCard className="gap-4 bg-white px-6 py-6">
          <Text className="font-sans text-sm leading-6 text-nf-secondary">
            Ajuste rápido de estado para operativa staff sin abrir el dashboard web.
          </Text>
          <View className="flex-row gap-3">
            <NFButton
              variant={detail.member.status === "active" ? "primary" : "muted"}
              loading={updateMemberMutation.isPending}
              onPress={() => changeStatus("active")}
            >
              Marcar activo
            </NFButton>
            <NFButton
              variant={detail.member.status === "paused" ? "primary" : "ghost"}
              loading={updateMemberMutation.isPending}
              onPress={() => changeStatus("paused")}
            >
              Pausar
            </NFButton>
          </View>
        </NFCard>
      </View>

      <View className="gap-4">
        <NFSectionTitle title="Rutina actual" />
        {detail.activeRoutine ? (
          <NFCard className="gap-4 bg-white px-6 py-6">
            <View className="gap-1">
              <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
                {detail.activeRoutine.title}
              </Text>
              <Text className="font-sans text-sm leading-6 text-nf-secondary">
                {detail.activeRoutine.summary}
              </Text>
            </View>
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 gap-1">
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                  Intensidad
                </Text>
                <Text className="font-sans text-sm text-nf-text">{detail.activeRoutine.intensityLabel}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                  Estado
                </Text>
                <Text className="font-sans text-sm text-nf-text">{detail.activeRoutine.statusLabel}</Text>
              </View>
            </View>
          </NFCard>
        ) : (
          <NFEmptyState
            icon={ImageIcon}
            title="Sin rutina activa"
            description="Esta ficha necesita una asignación antes de que el socio pueda verla en mobile."
            actionLabel="Asignar rutina"
            onActionPress={() =>
              router.push({
                pathname: "/modal/assign-routine",
                params: {
                  memberId: detail.member.id,
                  memberName: detail.member.fullName,
                },
              })
            }
          />
        )}
      </View>

      <View className="gap-4">
        <NFSectionTitle title="Comentarios" />
        <NFCard className="gap-4 bg-white px-6 py-6">
          <View className="flex-row items-center justify-between gap-4">
            <View className="gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Rutina activa
              </Text>
              <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
                {detail.member.currentRoutineTitle ?? "Sin rutina"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Heart
                size={16}
                color={detail.trainingFeedback.routine?.liked ? "#AE0011" : "#A8A29E"}
                fill={detail.trainingFeedback.routine?.liked ? "#AE0011" : "transparent"}
                strokeWidth={2.2}
              />
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                {detail.trainingFeedback.routine?.liked ? "Le gusta" : "Sin like"}
              </Text>
            </View>
          </View>

          <Text className="font-sans text-sm leading-6 text-nf-secondary">
            {detail.trainingFeedback.routine?.note ?? "Sin nota del socio sobre la rutina actual."}
          </Text>

          {detail.trainingFeedback.exercises.length ? (
            <View className="gap-3 border-t border-black/5 pt-4">
              {detail.trainingFeedback.exercises.map((exercise) => (
                <View key={exercise.exerciseId} className="gap-1">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="font-sans-black text-xs uppercase tracking-[1px] text-nf-text">
                      {exercise.exerciseName}
                    </Text>
                    <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                      {exercise.liked ? "Like" : "Neutro"}
                    </Text>
                  </View>
                  <Text className="font-sans text-sm leading-6 text-nf-secondary">
                    {exercise.note ?? "Sin nota"}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </NFCard>
      </View>

      <NFCard className="gap-3 bg-white px-6 py-6">
        <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
          Acción sugerida
        </Text>
        <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
          {detail.recommendedAction.title}
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          {detail.recommendedAction.helperText}
        </Text>
      </NFCard>

      <NFButton
        onPress={() =>
          router.push({
            pathname: "/modal/assign-routine",
            params: {
              memberId: detail.member.id,
              memberName: detail.member.fullName,
            },
          })
        }
        rightIcon={ArrowRight}
      >
        Asignar rutina
      </NFButton>
    </Screen>
  );
}
