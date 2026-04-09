"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard/tienda", label: "Resumen" },
  { href: "/dashboard/tienda/categorias", label: "Categorias" },
  { href: "/dashboard/tienda/productos", label: "Productos" },
  { href: "/dashboard/tienda/pedidos", label: "Pedidos" },
];

export default function StoreDashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(event) => {
              event.preventDefault();
              startTransition(() => {
                router.push(link.href);
              });
            }}
            className={cn(
              "rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-semibold text-[#5f6368] transition hover:border-[#d71920]/20 hover:text-[#111111]",
              isActive && "border-[#d71920]/20 bg-[#fff3f3] text-[#111111]",
              isPending && !isActive && "opacity-70",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      </nav>
      {isPending ? (
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#d71920]">
          Actualizando seccion de tienda...
        </p>
      ) : null}
    </div>
  );
}
