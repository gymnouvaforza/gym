"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function usePublicAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(() => !hasSupabasePublicEnv());

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return;
    }

    let active = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!active) {
          return;
        }

        setUser(data.user ?? null);
        setIsReady(true);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) {
          return;
        }

        setUser(session?.user ?? null);
        setIsReady(true);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    } catch {}

    return () => {
      active = false;
    };
  }, []);

  return {
    isAuthenticated: Boolean(user),
    isReady,
    user,
  };
}
