"use client";

import type { Auth } from "firebase/auth";

export async function syncFirebaseBrowserSession(auth: Auth) {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : null;

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "No se pudo sincronizar la sesion del dashboard.");
  }
}

export async function clearFirebaseBrowserSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  }).catch(() => undefined);
}
