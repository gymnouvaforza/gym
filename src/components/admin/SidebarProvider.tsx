"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";

export type SidebarState = "expanded" | "icons" | "hidden";

const STORAGE_KEY = "nuova-forza-sidebar-state";
const STORAGE_EVENT = "nuova-forza-sidebar-state-change";

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

function subscribeToSidebarState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore<SidebarState>(
    subscribeToSidebarState,
    readStoredState,
    () => "expanded",
  );

  const persist = useCallback((value: SidebarState) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
      window.dispatchEvent(new Event(STORAGE_EVENT));
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  const setState = useCallback((value: SidebarState) => {
    persist(value);
  }, [persist]);

  const toggle = useCallback(() => {
    const next: SidebarState = state === "expanded" ? "icons" : state === "icons" ? "hidden" : "expanded";
    persist(next);
  }, [persist, state]);

  const expand = useCallback(() => {
    persist("expanded");
  }, [persist]);

  const collapse = useCallback(() => {
    persist("icons");
  }, [persist]);

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
