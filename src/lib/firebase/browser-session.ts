"use client";

import type { Auth } from "firebase/auth";

export async function syncFirebaseBrowserSession(auth: Auth) {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : null;

  await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
    }),
  });
}

export async function clearFirebaseBrowserSession() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  }).catch(() => undefined);
}
