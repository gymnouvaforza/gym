"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { usePublicAuthState } from "@/components/auth/use-public-auth-state";

type SiteHeaderAuthActionsProps = {
  primaryLabel: string;
  mode?: "desktop" | "mobile";
};

export default function SiteHeaderAuthActions({
  primaryLabel,
  mode = "desktop",
}: Readonly<SiteHeaderAuthActionsProps>) {
  const { isAuthenticated } = usePublicAuthState();
  const primaryAction = isAuthenticated
    ? { href: "/#contacto", label: primaryLabel }
    : { href: "/registro", label: "Unirme" };
  const secondaryAction = isAuthenticated
    ? { href: "/mi-cuenta", label: "Mi cuenta" }
    : { href: "/acceso", label: "Acceso" };

  if (mode === "desktop") {
    return (
      <div className="hidden gap-4 sm:gap-6 lg:flex lg:items-center">
        <Button asChild variant="outline" className="h-10 px-6 font-semibold">
          <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
        </Button>
        <Button asChild className="btn-athletic btn-primary h-10 px-6 font-semibold">
          <Link href={primaryAction.href}>{primaryAction.label}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-2 xs:gap-3 border-t border-black/5 pt-6 lg:hidden">
      <Button asChild variant="outline" className="h-11 xs:h-12 w-full font-bold uppercase tracking-wider text-[11px] xs:text-xs">
        <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
      </Button>
      <Button asChild className="btn-athletic btn-primary h-11 xs:h-12 w-full font-bold uppercase tracking-wider text-[11px] xs:text-xs">
        <Link href={primaryAction.href}>{primaryAction.label}</Link>
      </Button>
    </div>
  );
}
