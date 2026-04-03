import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Session } from "@supabase/supabase-js";

import type { MobileRole, MobileSession } from "@mobile-contracts";

import { MobileApiError, mobileFetchJson } from "@/lib/api";
import { getSupabaseClient } from "@/lib/supabase";

interface AuthResult {
  error: string | null;
  needsEmailVerification?: boolean;
}

export interface AuthContextValue {
  isHydrated: boolean;
  isProfileLoading: boolean;
  profileError: string | null;
  session: Session | null;
  mobileSession: MobileSession | null;
  role: MobileRole | null;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshProfile(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export async function fetchMobileSession(session: Session) {
  return mobileFetchJson<MobileSession>("/api/mobile/me", {
    accessToken: session.access_token,
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [mobileSession, setMobileSession] = useState<MobileSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then((sessionResult) => {
        if (!isMounted) {
          return;
        }

        setSession(sessionResult.data.session);
        setIsHydrated(true);
      })
      .catch(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function refreshProfile() {
    if (!session) {
      setMobileSession(null);
      setProfileError(null);
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);

    try {
      const nextSession = await fetchMobileSession(session);
      setMobileSession(nextSession);
    } catch (error) {
      if (error instanceof MobileApiError && error.status === 401) {
        await supabase.auth.signOut();
      }

      setMobileSession(null);
      setProfileError(error instanceof Error ? error.message : "No se pudo cargar la sesion mobile.");
    } finally {
      setIsProfileLoading(false);
    }
  }

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!session) {
      setMobileSession(null);
      setIsProfileLoading(false);
      setProfileError(null);
      return;
    }

    void refreshProfile();
  }, [isHydrated, session?.access_token]);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return {
      error: error?.message ?? null,
      needsEmailVerification: !error && !data.session,
    };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMobileSession(null);
    setProfileError(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isHydrated,
      isProfileLoading,
      profileError,
      session,
      mobileSession,
      role: mobileSession?.role ?? null,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [isHydrated, isProfileLoading, mobileSession, profileError, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
