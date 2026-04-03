import "react-native-url-polyfill/auto";

import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";

import { getMobileConfig } from "@/lib/mobile-config";

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  const config = getMobileConfig();
  client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: secureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-client-info": "nova-forza-mobile",
      },
    },
  });

  return client;
}
