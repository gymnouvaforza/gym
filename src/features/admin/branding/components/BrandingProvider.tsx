"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import type { SiteSettings } from "@/lib/supabase/database.types";

interface BrandingContextType {
  gymName: string;
  logoUrl: string | null;
  primaryColor: string;
  setBranding: (branding: Partial<{ gymName: string; logoUrl: string | null; primaryColor: string }>) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ 
  children, 
  initialSettings 
}: { 
  children: ReactNode; 
  initialSettings: SiteSettings;
}) {
  const [gymName, setGymName] = useState(initialSettings.site_name);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url);
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color ?? "#d71920");

  const setBranding = (branding: Partial<{ gymName: string; logoUrl: string | null; primaryColor: string }>) => {
    if (branding.gymName !== undefined) setGymName(branding.gymName);
    if (branding.logoUrl !== undefined) setLogoUrl(branding.logoUrl);
    if (branding.primaryColor !== undefined) setPrimaryColor(branding.primaryColor);
  };

  return (
    <BrandingContext.Provider value={{ gymName, logoUrl, primaryColor, setBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
