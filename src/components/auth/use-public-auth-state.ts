"use client";

import { useEffect, useState } from "react";

import type { AuthUser } from "@/lib/auth-user";
import { buildAuthUser } from "@/lib/auth-user";
import { getFirebaseBrowserAuth } from "@/lib/firebase/client";
import { hasSupabasePublicEnv } from "@/lib/env";

export function usePublicAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(() => !hasSupabasePublicEnv());

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      return;
    }

    let active = true;

    try {
      let unsubscribe: (() => void) | undefined;

      void getFirebaseBrowserAuth().then((auth) => {
        if (!auth || !active) {
          setIsReady(true);
          return;
        }

        unsubscribe = auth.onAuthStateChanged((nextUser) => {
          if (!active) {
            return;
          }

          setUser(
            nextUser
              ? buildAuthUser({
                  id: nextUser.uid,
                  email: nextUser.email,
                  emailVerified: nextUser.emailVerified,
                  fullName: nextUser.displayName,
                  provider: nextUser.providerData[0]?.providerId ?? "password",
                })
              : null,
          );
          setIsReady(true);
        });
      });

      return () => {
        active = false;
        unsubscribe?.();
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
