"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SiteHeaderAuthActionsProps = {
  primaryLabel: string;
  mode?: "desktop" | "mobile";
};

export default function SiteHeaderAuthActions({
  primaryLabel,
  mode = "desktop",
}: Readonly<SiteHeaderAuthActionsProps>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    try {
      const supabase = createSupabaseBrowserClient();

      void supabase.auth.getUser().then(({ data }) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(data.user));
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) {
          return;
        }

        setIsAuthenticated(Boolean(session?.user));
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

  const primaryAction = isAuthenticated
    ? { href: "/#contacto", label: primaryLabel }
    : { href: "/registro", label: "Unirme" };
  const secondaryAction = isAuthenticated
    ? { href: "/mi-cuenta", label: "Mi cuenta" }
    : { href: "/acceso", label: "Acceso" };

  if (mode === "desktop") {
    return (
      <div className="hidden lg:flex lg:items-center gap-4 sm:gap-6">
        <Button
          asChild
          variant="outline"
          className="h-10 px-6 font-semibold"
        >
          <Link href={secondaryAction.href}>
            {secondaryAction.label}
          </Link>
        </Button>
        <Button
          asChild
          className="btn-athletic btn-primary h-10 px-6 font-semibold"
        >
          <Link href={primaryAction.href}>
            {primaryAction.label}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/8 pt-4 lg:hidden">
      <Button asChild variant="outline" className="h-10 w-full font-semibold">
        <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
      </Button>
      <Button asChild className="btn-athletic btn-primary h-10 w-full font-semibold">
        <Link href={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
    </div>
  );
}
