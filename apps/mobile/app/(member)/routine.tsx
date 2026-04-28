import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Dumbbell,
  Heart,
  Info,
  Repeat,
  Target,
  Timer,
  UserRound,
  UserRoundX,
} from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFSectionTitle } from "@/components/ui/nf-section-title";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import {
  useMemberRoutineQuery,
  useUpdateExerciseFeedbackMutation,
  useUpdateRoutineFeedbackMutation,
} from "@/hooks/use-mobile-queries";
import { formatShortDate, formatShortDateTime } from "@/lib/format";
import { useAuth } from "@/providers/auth-provider";

const routineHero = require("../../assets/nova-routine-hero.png");

export default function MemberRoutineScreen() {
  const { mobileSession, profileError } = useAuth();
  const routineQuery = useMemberRoutineQuery();
  const updateRoutineFeedbackMutation = useUpdateRoutineFeedbackMutation();
  const updateExerciseFeedbackMutation = useUpdateExerciseFeedbackMutation();
  const [routineNote, setRoutineNote] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>({});
  const [likedExercises, setLikedExercises] = useState<Record<string, boolean>>({});
  const [justLikedRoutine, setJustLikedRoutine] = useState(false);
  const [justLikedExercise, setJustLikedExercise] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const routine = routineQuery.data?.routine;
  const savedRoutine = routine as NonNullable<typeof routine>;

  useEffect(() => {
    if (!routine) {
      return;
    }

    setRoutineNote(routine.memberNote ?? "");
    setExerciseNotes(
      Object.fromEntries(
        routine.blocks.flatMap((block) =>
          block.exercises.map((exercise) => [exercise.id, exercise.memberNote ?? ""]),
        ),
      ),
    );
    setLikedExercises(
      Object.fromEntries(routine.blocks.flatMap((block) => block.exercises.map((e) => [e.id, e.liked]))),
    );
  }, [routine]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await routineQuery.refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (routineQuery.isLoading) {
    return <NFLoadingState label="Iniciando motores..." />;
  }

  if (routineQuery.isError) {
    return (
      <Screen
        header={<NFTopBar title="TU RUTINA" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
      >
        <NFEmptyState
          icon={AlertTriangle}
          title="ERROR DE CONEXIÓN"
          description="No pudimos cargar tu rutina. Verifica tu conexión e intenta de nuevo."
          actionLabel="REINTENTAR"
          onActionPress={() => void routineQuery.refetch()}
        />
      </Screen>
    );
  }

  if (!mobileSession?.member) {
    return (
      <Screen
        header={<NFTopBar title="ENTRENAMIENTO" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
      >
        <NFEmptyState
          icon={UserRoundX}
          title="PERFIL NO DISPONIBLE"
          description={
            profileError
              ? `No pudimos sincronizar tu perfil mobile: ${profileError}`
              : "Tu acceso ya existe, pero no pudimos recuperar tu perfil de miembro para cargar la rutina."
          }
          actionLabel="REVISAR CUENTA"
          onActionPress={() => router.push("/(member)/account")}
        />
      </Screen>
    );
  }

  if (!routine) {
    return (
      <Screen
        header={<NFTopBar title="TU RUTINA" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
        contentClassName="gap-6 px-6 py-6"
      >
        <NFEmptyState
          icon={Activity}
          title="SIN RUTINA ACTIVA"
          description="Tu perfil ya está operativo, pero todavía no tienes un bloque activo asignado por el coach."
          actionLabel="REVISAR CUENTA"
          onActionPress={() => router.push("/(member)/account")}
        />
      </Screen>
    );
  }

  const scheduleLabel = routine.recommendedScheduleLabel ?? "Horario libre";
  const coachLabel = routine.trainerName ?? "Coach del club";

  async function toggleRoutineLike() {
    try {
      const newLiked = !savedRoutine.liked;
      setJustLikedRoutine(true);
      setTimeout(() => setJustLikedRoutine(false), 1200);
      await updateRoutineFeedbackMutation.mutateAsync({
        liked: newLiked,
        note: routineNote,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function saveRoutineNote() {
    try {
      await updateRoutineFeedbackMutation.mutateAsync({
        liked: savedRoutine.liked,
        note: routineNote,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function toggleExerciseLike(exerciseId: string) {
    const newLiked = !likedExercises[exerciseId];
    setLikedExercises((prev) => ({ ...prev, [exerciseId]: newLiked }));
    setJustLikedExercise(exerciseId);
    setTimeout(() => setJustLikedExercise(null), 1200);
  }

  async function saveExerciseLike(exerciseId: string) {
    try {
      await updateExerciseFeedbackMutation.mutateAsync({
        exerciseId,
        liked: likedExercises[exerciseId] ?? false,
        note: exerciseNotes[exerciseId] ?? "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Screen
      header={<NFTopBar title="TU RUTINA" leftIcon={ArrowLeft} onLeftPress={() => router.back()} />}
      contentClassName="gap-0 px-0 py-0"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#d71920"]} />}
      >
        <View className="relative h-[260px] bg-black">
          <Image
            source={routine.heroImageUrl ? { uri: routine.heroImageUrl } : routineHero}
            contentFit="cover"
            style={{ width: "100%", height: "100%", opacity: 0.68 }}
          />
          <View className="absolute inset-0 bg-black/20" />
          <View className="absolute bottom-0 left-0 right-0 gap-4 p-8">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-nfPrimary" />
                <Text className="font-sans-bold text-[10px] uppercase tracking-[3px] text-white/70">
                  Sesión sugerida activa
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => void toggleRoutineLike()}>
                <View
                  className={`flex-row items-center gap-2 rounded-full border px-4 py-2 ${
                    justLikedRoutine
                      ? routine.liked
                        ? "border-nf-primary bg-nf-primary/10"
                        : "border-black/20 bg-black/10"
                      : routine.liked
                        ? "border-nf-primary/40 bg-nf-primary/10"
                        : "border-white/20 bg-black/20"
                  }`}
                >
                  <Heart
                    size={18}
                    color={routine.liked ? "#d71920" : "#ffffff"}
                    fill={routine.liked ? "#d71920" : "transparent"}
                    strokeWidth={2.2}
                  />
                  {justLikedRoutine && (
                    <Text className="font-sans-bold text-[10px] tracking-[1px] text-white/90">
                      {routine.liked ? "ENVIADO" : "QUITADO"}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>

            <Text className="font-display-bold text-[42px] uppercase leading-[40px] tracking-tighter text-white italic">
              {routine.title}
            </Text>
            <Text className="max-w-[90%] font-sans text-sm leading-6 text-white/80">{routine.summary}</Text>
          </View>
        </View>

        <View className="bg-white px-8 py-6">
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[140px] flex-1 gap-2 border border-black/5 bg-[#fbfbf8] p-4">
              <View className="flex-row items-center gap-2">
                <UserRound size={14} color="#111111" />
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                  Coach
                </Text>
              </View>
              <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">{coachLabel}</Text>
            </View>

            <View className="min-w-[140px] flex-1 gap-2 border border-black/5 bg-[#fbfbf8] p-4">
              <View className="flex-row items-center gap-2">
                <CalendarClock size={14} color="#111111" />
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                  Hora recomendada
                </Text>
              </View>
              <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">{scheduleLabel}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-3">
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Asignada
              </Text>
              <Text className="font-sans text-sm text-nf-text">{formatShortDateTime(routine.assignedAt)}</Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Inicio
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {routine.startsOn ? formatShortDate(routine.startsOn) : "Inmediato"}
              </Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                Vigencia
              </Text>
              <Text className="font-sans text-sm text-nf-text">
                {routine.endsOn ? formatShortDate(routine.endsOn) : "Sin cierre"}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row border-b border-t border-black/5 bg-white">
          <View className="flex-1 items-center border-r border-black/5 p-6">
            <Target size={16} color="#d71920" />
            <Text className="mt-2 font-sans-black text-xs uppercase tracking-widest text-nf-text">
              {routine.goal}
            </Text>
            <Text className="mt-1 font-sans-bold text-[8px] uppercase tracking-wider text-nf-secondary">
              Objetivo
            </Text>
          </View>
          <View className="flex-1 items-center border-r border-black/5 p-6">
            <Timer size={16} color="#111111" />
            <Text className="mt-2 font-sans-black text-xs uppercase tracking-widest text-nf-text">
              {routine.durationLabel}
            </Text>
            <Text className="mt-1 font-sans-bold text-[8px] uppercase tracking-wider text-nf-secondary">
              Ciclo
            </Text>
          </View>
          <View className="flex-1 items-center p-6">
            <Repeat size={16} color="#111111" />
            <Text className="mt-2 font-sans-black text-xs uppercase tracking-widest text-nf-text">
              {routine.intensityLabel}
            </Text>
            <Text className="mt-1 font-sans-bold text-[8px] uppercase tracking-wider text-nf-secondary">
              Carga
            </Text>
          </View>
        </View>

        <View className="gap-10 p-8">
          <View className="gap-5">
            <NFSectionTitle title="FEEDBACK" />

            <Pressable
              onPress={() => void toggleRoutineLike()}
              className={`self-start rounded-full border-2 px-6 py-3 ${
                routine.liked
                  ? "border-nf-primary bg-nf-primary"
                  : "border-nf-line bg-nf-surface"
              }`}
            >
              <View className="flex-row items-center gap-2">
                <Heart
                  size={20}
                  color={routine.liked ? "#FFFFFF" : "#AE0011"}
                  fill={routine.liked ? "#ffffff" : "transparent"}
                  strokeWidth={2.2}
                />
                <Text
                  className={`font-sans-bold text-sm uppercase tracking-[1px] ${
                    routine.liked ? "text-white" : "text-nf-text"
                  }`}
                >
                  {routine.liked ? "Me gusta" : "Me gusta"}
                </Text>
              </View>
            </Pressable>

            <View className="gap-5 border border-nf-line bg-nf-surface p-6">
              <Text className="font-sans-bold text-[10px] uppercase tracking-[2px] text-nf-secondary">
                Nota para el coach
              </Text>
              <View className="overflow-hidden rounded-sm border border-nf-muted bg-nf-base">
                <TextInput
                  value={routineNote}
                  onChangeText={setRoutineNote}
                  multiline
                  numberOfLines={4}
                  placeholder="Ej. Me viene mejor por la tarde y noto mejora en pierna."
                  placeholderTextColor="#A8A29E"
                  textAlignVertical="top"
                  className="min-h-[120px] px-4 py-3 font-sans text-[15px] leading-6 text-nf-text"
                />
              </View>
              <NFButton
                variant="primary"
                loading={updateRoutineFeedbackMutation.isPending}
                onPress={() => void saveRoutineNote()}
              >
                Guardar feedback
              </NFButton>
            </View>
          </View>

          <View className="gap-8">
            <NFSectionTitle title="BLOQUES" accentLabel={`${routine.blocks.length} BLOQUES`} />

            {routine.blocks.map((block, blockIndex) => (
              <View key={block.id} className="gap-4">
                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center bg-black">
                    <Text className="font-display-bold text-xl text-white">{blockIndex + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-display-bold text-2xl uppercase tracking-tighter text-nf-text italic">
                      {block.title}
                    </Text>
                    <View className="mt-1 h-px bg-black/5" />
                  </View>
                </View>

                {block.description ? (
                  <Text className="bg-nf-soft p-4 font-sans-bold text-[11px] uppercase tracking-wider text-nf-secondary italic leading-5">
                    Nota del coach: {block.description}
                  </Text>
                ) : null}

                <View className="gap-3">
                  {block.exercises.map((exercise) => (
                    <View key={exercise.id} className="border border-black/5 bg-white p-6 shadow-sm">
                      <View className="mb-4 flex-row items-start justify-between gap-4">
                        <View className="flex-1 pr-2">
                          <Text className="font-sans-black text-[16px] uppercase leading-tight tracking-tight text-nf-text">
                            {exercise.name}
                          </Text>
                        </View>
                        <View className="items-end gap-2">
                          <View className="bg-nf-primary px-2 py-1">
                            <Text className="font-sans-black text-[10px] uppercase text-white">
                              {exercise.sets} SETS
                            </Text>
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => toggleExerciseLike(exercise.id)}
                          >
                            <View
                              className={`flex-row items-center gap-2 rounded-full border px-4 py-2 ${
                                likedExercises[exercise.id]
                                  ? "border-nf-primary bg-nf-primary"
                                  : justLikedExercise === exercise.id
                                    ? "border-black/20 bg-black/5"
                                    : "border-black/20 bg-white"
                              }`}
                            >
                              <Heart
                                size={14}
                                color={likedExercises[exercise.id] ? "#ffffff" : "#AE0011"}
                                fill={likedExercises[exercise.id] ? "#ffffff" : "transparent"}
                                strokeWidth={2}
                              />
                            </View>
                          </Pressable>
                        </View>
                      </View>

                      <View className="mb-4 flex-row items-center gap-6 border-y border-black/5 py-3">
                        <View className="flex-row items-center gap-2">
                          <Repeat size={12} color="#7a7f87" />
                          <Text className="font-sans-bold text-xs uppercase tracking-tighter text-nf-text">
                            {exercise.reps} REPS
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Timer size={12} color="#7a7f87" />
                          <Text className="font-sans-bold text-xs uppercase tracking-tighter text-nf-text">
                            {exercise.restSeconds}S REST
                          </Text>
                        </View>
                      </View>

                      {exercise.notes ? (
                        <View className="mb-4 flex-row items-start gap-2">
                          <Info size={12} color="#d71920" className="mt-1" />
                          <Text className="flex-1 font-sans text-xs leading-5 text-nf-secondary">
                            {exercise.notes}
                          </Text>
                        </View>
                      ) : null}

                      <View className="gap-3 bg-nf-soft rounded-md p-4">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-sans-bold text-[9px] uppercase tracking-[1px] text-nf-secondary">
                            Tu nota para este ejercicio
                          </Text>
                        </View>
                        <View
                          className={`rounded-md border px-3 py-3 ${
                            (exerciseNotes[exercise.id] ?? "").length > 0
                              ? "border-nf-primary/30 bg-white"
                              : "border-black/10 bg-white"
                          }`}
                        >
                          <TextInput
                            value={exerciseNotes[exercise.id] ?? ""}
                            onChangeText={(value) =>
                              setExerciseNotes((current) => ({
                                ...current,
                                [exercise.id]: value,
                              }))
                            }
                            multiline
                            numberOfLines={3}
                            placeholder="Apunta como te fue este ejercicio."
                            placeholderTextColor="#A8A29E"
                            textAlignVertical="top"
                            className="min-h-[84px] font-sans text-[14px] leading-5 text-nf-text"
                          />
                        </View>
                        <NFButton
                          variant={exerciseNotes[exercise.id]?.length > 0 ? "primary" : "muted"}
                          loading={updateExerciseFeedbackMutation.isPending}
                          onPress={() => void saveExerciseLike(exercise.id)}
                          textClassName="text-xs tracking-[1px]"
                        >
                          Guardar nota
                        </NFButton>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View className="items-center pb-20 pt-10">
            <Dumbbell size={24} color="#111111" opacity={0.1} />
            <Text className="mt-4 font-sans-bold text-[9px] uppercase tracking-[0.4em] text-nf-secondary opacity-30">
              NOVA FORZA TRAINING HUB
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
