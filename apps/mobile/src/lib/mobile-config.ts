import Constants from "expo-constants";
import { Platform } from "react-native";
import { z } from "zod";

const MobileConfigSchema = z.object({
  apiBaseUrl: z.string().url(),
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string().min(1),
});

export type MobileConfig = z.infer<typeof MobileConfigSchema>;

function resolveExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? null;

  if (!hostUri) {
    return null;
  }

  const sanitizedHost = hostUri.replace(/^https?:\/\//, "").split(":")[0]?.trim();
  return sanitizedHost || null;
}

export function normalizeApiBaseUrl(apiBaseUrl: string, platform = Platform.OS, expoHost = resolveExpoHost()) {
  const url = new URL(apiBaseUrl);
  const isLocalHost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "10.0.2.2";

  if (expoHost && isLocalHost) {
    if (platform === "android" && expoHost === "localhost") {
      url.hostname = "10.0.2.2";
    } else {
      url.hostname = expoHost;
    }
  } else {
    if (platform === "ios" && url.hostname === "10.0.2.2") {
      url.hostname = "localhost";
    }

    if (platform === "android" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
      url.hostname = "10.0.2.2";
    }
  }

  return url.toString().replace(/\/$/, "");
}

function readRawMobileConfig() {
  const extra = Constants.expoConfig?.extra ?? {};

  return {
    apiBaseUrl:
      typeof extra.apiBaseUrl === "string"
        ? normalizeApiBaseUrl(extra.apiBaseUrl)
        : extra.apiBaseUrl,
    supabaseUrl: extra.supabaseUrl,
    supabaseAnonKey: extra.supabaseAnonKey,
  };
}

export function getMobileConfig() {
  return MobileConfigSchema.parse(readRawMobileConfig());
}

export function getMobileConfigState():
  | { ok: true; config: MobileConfig }
  | { ok: false; message: string } {
  const parsed = MobileConfigSchema.safeParse(readRawMobileConfig());

  if (parsed.success) {
    return { ok: true, config: parsed.data };
  }

  return {
    ok: false,
    message:
      "Faltan variables para Supabase en Expo. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY antes de abrir la app.",
  };
}
