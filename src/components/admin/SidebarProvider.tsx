"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type SidebarState = "expanded" | "icons" | "hidden";

const STORAGE_KEY = "nuova-forza-sidebar-state";

interface SidebarContextType {
  state: SidebarState;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  setState: (state: SidebarState) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

function readStoredState(): SidebarState {
  if (typeof window === "undefined") return "expanded";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "icons" || stored === "hidden") return stored;
    return "expanded";
  } catch {
    return "expanded";
  }
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [state, setStateState] = useState<SidebarState>("expanded");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    setStateState(readStoredState());
    setHydrated(true);
  }, []);

  const persist = useCallback((value: SidebarState) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  const setState = useCallback((value: SidebarState) => {
    setStateState(value);
    persist(value);
  }, [persist]);

  const toggle = useCallback(() => {
    setStateState((prev) => {
      const next: SidebarState = prev === "expanded" ? "icons" : prev === "icons" ? "hidden" : "expanded";
      persist(next);
      return next;
    });
  }, [persist]);

  const expand = useCallback(() => {
    setStateState("expanded");
    persist("expanded");
  }, [persist]);

  const collapse = useCallback(() => {
    setStateState("icons");
    persist("icons");
  }, [persist]);

  // During SSR / pre-hydration, render with expanded (default) to match server
  if (!hydrated) {
    return (
      <SidebarContext.Provider value={{ state: "expanded", toggle, expand, collapse, setState }}>
        {children}
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider value={{ state, toggle, expand, collapse, setState }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
