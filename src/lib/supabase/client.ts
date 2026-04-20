"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getFirebaseBrowserAuth } from "@/lib/firebase/client";
import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let browserClient: SupabaseClient<Database> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getPublicSupabaseEnv();
  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    accessToken: async () => {
      const auth = await getFirebaseBrowserAuth();
      return auth?.currentUser ? auth.currentUser.getIdToken() : null;
    },
  });
  return browserClient;
}
