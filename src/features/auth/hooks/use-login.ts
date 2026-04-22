"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseBrowserAuth } from "@/lib/firebase/client";
import { syncFirebaseBrowserSession } from "@/lib/firebase/browser-session";
import type { LoginValues } from "@/lib/validators/auth";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "admin-only"
      ? "Esta cuenta no tiene acceso al backoffice."
      : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const next = searchParams.get("next") || "/dashboard";

  async function login(values: LoginValues) {
    setError(null);
    setIsLoading(true);

    try {
      // Manejo de login local (dev/admin sin email)
      if (!values.identity.includes("@")) {
        const response = await fetch("/api/dev-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error ?? "No se pudo iniciar sesion local.");
        }

        router.push(next);
        router.refresh();
        return;
      }

      // Login con Firebase
      const auth = await getFirebaseBrowserAuth();
      if (!auth) throw new Error("Servicio de autenticacion no disponible.");

      await signInWithEmailAndPassword(auth, values.identity, values.password);
      await syncFirebaseBrowserSession(auth);

      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    login,
    error,
    isLoading,
  };
}
