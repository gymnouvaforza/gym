import { Text, View } from "react-native";

import { LogOut, ShieldCheck } from "lucide-react-native";

import { NFButton } from "@/components/ui/nf-button";
import { NFCard } from "@/components/ui/nf-card";
import { NFTopBar } from "@/components/ui/nf-top-bar";
import { Screen } from "@/components/ui/screen";
import { useAuth } from "@/providers/auth-provider";

export default function StaffAccountScreen() {
  const { mobileSession, signOut } = useAuth();

  return (
    <Screen header={<NFTopBar title="Cuenta" />} contentClassName="gap-6 px-6 py-6">
      <View className="gap-3">
        <Text className="font-display text-[34px] uppercase leading-[34px] tracking-tight text-nf-text">
          {mobileSession?.displayName ?? "Staff"}
        </Text>
        <Text className="font-sans text-sm leading-6 text-nf-secondary">
          Sesión operativa para consulta rápida, asignación de rutinas y seguimiento de miembros.
        </Text>
      </View>

      <NFCard className="gap-4 bg-white px-6 py-6">
        <View className="flex-row items-center gap-3">
          <ShieldCheck size={18} color="#AE0011" strokeWidth={2.2} />
          <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
            Staff autorizado
          </Text>
        </View>
        <View className="gap-1">
          <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
            Email
          </Text>
          <Text className="font-sans text-sm text-nf-text">{mobileSession?.email}</Text>
        </View>
        <View className="gap-1">
          <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
            Rol
          </Text>
          <Text className="font-sans-black text-sm uppercase tracking-[1px] text-nf-text">
            {mobileSession?.role === "staff" ? "Staff" : mobileSession?.role}
          </Text>
        </View>
      </NFCard>

      <NFButton variant="ghost" onPress={() => void signOut()} rightIcon={LogOut}>
        Cerrar sesión
      </NFButton>
    </Screen>
  );
}
