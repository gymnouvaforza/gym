import { useState } from "react";
import { Text, View } from "react-native";

import { CircleAlert, Info, ShieldCheck, ShieldOff } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFLoadingState } from "@/components/ui/nf-loading-state";
import { NFToast } from "@/components/ui/nf-toast";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useSystemModulesQuery, useToggleSystemModuleMutation } from "@/hooks/use-mobile-queries";
import { useAuth } from "@/providers/auth-provider";

export default function StaffDeveloperScreen() {
  const { mobileSession } = useAuth();
  const modulesQuery = useSystemModulesQuery();
  const toggleMutation = useToggleSystemModuleMutation();
  const [pendingModuleName, setPendingModuleName] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (mobileSession?.staffAccessLevel !== "superadmin") {
    return (
      <Screen header={<NFTopBar title="Developer" />} contentClassName="gap-6 px-6 py-6">
        <NFEmptyState
          icon={ShieldOff}
          title="Acceso restringido"
          description="Esta consola mobile solo esta disponible para superadmin."
        />
      </Screen>
    );
  }

  if (modulesQuery.isLoading && !modulesQuery.data) {
    return <NFLoadingState label="Cargando modulos..." />;
  }

  if (modulesQuery.isError) {
    return (
      <Screen header={<NFTopBar title="Developer" />} contentClassName="gap-6 px-6 py-6">
        <NFEmptyState
          icon={CircleAlert}
          title="No pudimos cargar modulos"
          description="Revisa tu conexion o vuelve a intentar en unos segundos."
          actionLabel="Reintentar"
          onActionPress={() => void modulesQuery.refetch()}
        />
      </Screen>
    );
  }

  const items = modulesQuery.data?.items ?? [];

  return (
    <Screen header={<NFTopBar title="Developer" />} contentClassName="gap-4 px-6 py-6">
      <View className="gap-2">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          Kernel mobile
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          Controla modulos globales desde la app. Los cambios impactan dashboard web, rutas publicas y futuras superficies mobile.
        </Text>
      </View>

      {feedbackMessage ? <NFToast message={feedbackMessage} /> : null}

      {items.map((item) => {
        const isPending = toggleMutation.isPending && pendingModuleName === item.name;

        return (
          <NFCard key={item.name} className="gap-4 bg-white px-6 py-6">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="font-display-bold text-[22px] uppercase tracking-tight text-nf-text">
                    {item.label}
                  </Text>
                  {item.isEnabled ? (
                    <ShieldCheck size={16} color="#AE0011" strokeWidth={2.1} />
                  ) : (
                    <ShieldOff size={16} color="#1A1C19" strokeWidth={2.1} />
                  )}
                </View>
                <Text className="font-sans text-sm leading-6 text-nf-secondary">
                  {item.description}
                </Text>
              </View>
              <View className={`rounded-full px-3 py-2 ${item.isEnabled ? "bg-nf-primary" : "bg-nf-muted"}`}>
                <Text
                  className={`font-sans-black text-[10px] uppercase tracking-[1px] ${
                    item.isEnabled ? "text-white" : "text-nf-text"
                  }`}
                >
                  {item.isEnabled ? "Activo" : "Off"}
                </Text>
              </View>
            </View>

            <View className="gap-2 rounded-lg bg-nf-base px-4 py-4">
              <View className="flex-row items-center gap-2">
                <Info size={16} color="#AE0011" strokeWidth={2.1} />
                <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
                  Impacto al apagar
                </Text>
              </View>
              <Text className="font-sans text-sm leading-6 text-nf-text">{item.disabledImpact}</Text>
            </View>

            <NFButton
              variant={item.isEnabled ? "muted" : "primary"}
              loading={isPending}
              onPress={async () => {
                setPendingModuleName(item.name);
                setFeedbackMessage(null);
                try {
                  const response = await toggleMutation.mutateAsync({
                    name: item.name,
                    isEnabled: !item.isEnabled,
                  });
                  setFeedbackMessage(
                    response.item.isEnabled
                      ? `${response.item.label} activado correctamente.`
                      : `${response.item.label} desactivado correctamente.`,
                  );
                } catch (error) {
                  setFeedbackMessage(
                    error instanceof Error ? error.message : "No se pudo actualizar el modulo.",
                  );
                  console.error(error);
                } finally {
                  setPendingModuleName(null);
                }
              }}
            >
              {item.isEnabled ? "Apagar modulo" : "Encender modulo"}
            </NFButton>
          </NFCard>
        );
      })}
    </Screen>
  );
}
