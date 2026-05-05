"use client";

import Link from "next/link";
import { ClipboardList, QrCode, Tag } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  {
    href: "/dashboard/membresias/pedidos",
    icon: ClipboardList,
    label: "Solicitudes",
    description: "Altas, renovaciones y cobro manual.",
  },
  {
    href: "/dashboard/membresias/planes",
    icon: Tag,
    label: "Planes",
    description: "Precios, duracion y reglas de congelamiento.",
  },
  {
    href: "/dashboard/membresias/recepcion",
    icon: QrCode,
    label: "Escaneo QR",
    description: "Escanea el QR para validar el ingreso.",
  },
] as const;

export default function MembershipOpsSubnav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group min-w-[220px] border px-4 py-3 transition-colors",
              isActive
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-black/10 bg-white text-[#111111] hover:border-[#111111]",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border",
                  isActive
                    ? "border-white/10 bg-white/5 text-[#d71920]"
                    : "border-[#d71920]/10 bg-[#fff5f5] text-[#d71920]",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "text-xs leading-5",
                    isActive ? "text-white/65" : "text-[#5f6368]",
                  )}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
