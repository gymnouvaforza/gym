import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Eye, EyeOff } from "lucide-react-native";

import { cn } from "@/lib/cn";

interface NFInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  autoComplete?: "email" | "password" | "new-password" | "off";
}

export function NFInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
  autoComplete = "off",
}: NFInputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <View className="w-full gap-2">
      <Text className="font-sans-bold text-[10px] uppercase tracking-[1px] text-nf-secondary">
        {label}
      </Text>
      <View className="flex-row items-center bg-nf-muted px-4 py-4">
        <TextInput
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8B8176"
          secureTextEntry={isPassword && !visible}
          value={value}
          className={cn(
            "flex-1 font-sans-bold text-base text-nf-text",
            isPassword ? "pr-3" : "",
          )}
        />
        {isPassword ? (
          <Pressable accessibilityRole="button" onPress={() => setVisible((current) => !current)}>
            {visible ? (
              <EyeOff size={18} color="#5D3F3C" strokeWidth={2} />
            ) : (
              <Eye size={18} color="#5D3F3C" strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
