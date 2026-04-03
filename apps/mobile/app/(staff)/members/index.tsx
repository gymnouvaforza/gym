import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { ArrowRight, Search, Users } from "lucide-react-native";

import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFInput } from "@/components/ui/nf-input";
import { NFStatusBadge } from "@/components/ui/nf-status-badge";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useStaffMembersQuery } from "@/hooks/use-mobile-queries";

export default function StaffMembersScreen() {
  const [search, setSearch] = useState("");
  const membersQuery = useStaffMembersQuery(search);

  if (membersQuery.isLoading) {
    return <NFLoadingState label="Cargando miembros..." />;
  }

  const items = membersQuery.data?.items ?? [];

  return (
    <Screen header={<NFTopBar title="Miembros" />} scroll={false} contentClassName="flex-1 px-6 py-6">
      <View className="flex-1 gap-5">
        <NFInput
          label="Buscar miembro"
          value={search}
          onChangeText={setSearch}
          placeholder="Nombre, plan o prioridad"
        />

        {items.length === 0 ? (
          <NFEmptyState
            icon={Users}
            title="Lista vacía"
            description="No encontramos miembros con ese criterio de búsqueda."
          />
        ) : (
          <FlashList
            className="flex-1"
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push(`/(staff)/members/${item.id}`)}>
                {({ pressed }) => (
                  <NFCard className={`mb-4 gap-4 bg-white px-6 py-5 ${pressed ? "opacity-85" : ""}`}>
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1 gap-2">
                        <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
                          {item.fullName}
                        </Text>
                        <Text className="font-sans text-sm text-nf-secondary">{item.planLabel}</Text>
                      </View>
                      <ArrowRight size={18} color="#AE0011" strokeWidth={2.2} />
                    </View>
                    <View className="flex-row items-center justify-between gap-4">
                      <NFStatusBadge status={item.status} />
                      <Text className="flex-1 text-right font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                        {item.priorityLabel ?? item.routineTitle ?? "Sin rutina"}
                      </Text>
                    </View>
                  </NFCard>
                )}
              </Pressable>
            )}
            ListHeaderComponent={
              <View className="mb-4 flex-row items-center gap-3 bg-nf-soft px-4 py-4">
                <Search size={18} color="#AE0011" strokeWidth={2.2} />
                <Text className="font-sans text-sm text-nf-secondary">
                  Consulta rápida y acceso directo a asignación de rutina.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Screen>
  );
}
