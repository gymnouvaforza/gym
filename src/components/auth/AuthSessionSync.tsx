"use client";

import { onIdTokenChanged } from "firebase/auth";
import { useEffect } from "react";

import { getFirebaseBrowserAuth } from "@/lib/firebase/client";

async function syncSession(idToken: string | null) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
    }),
  }).catch(() => undefined);
}

export default function AuthSessionSync() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void getFirebaseBrowserAuth().then((auth) => {
      if (!auth) {
        return;
      }

      unsubscribe = onIdTokenChanged(auth, async (user) => {
        const idToken = user ? await user.getIdToken() : null;
        await syncSession(idToken);
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return null;
}
