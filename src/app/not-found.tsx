import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Página no encontrada");

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f0] px-6 text-center">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center bg-[#111111]">
          <Search className="h-10 w-10 text-[#d71920]" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[#d71920] px-2 py-1 font-display text-xs font-black italic text-white">
          404
        </div>
      </div>
      
      <h1 className="mt-10 font-display text-5xl font-black uppercase tracking-tight text-[#111111] sm:text-7xl italic">
        Objetivo <span className="text-black/10">Fuera de</span> Alcance
      </h1>
      
      <p className="mt-6 max-w-md text-sm font-medium leading-7 text-[#4b5563]">
        La ruta que intentas seguir no existe en nuestro sistema. Es posible que el contenido haya sido movido o el enlace sea incorrecto.
      </p>

      <div className="mt-12">
        <Button
          asChild
          variant="default"
          className="btn-athletic min-w-[240px]"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar a la Base
          </Link>
        </Button>
      </div>

      <div className="mt-16 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#111111]/20">
        <div className="h-px w-8 bg-black/10" />
        Nova Forza Gym
        <div className="h-px w-8 bg-black/10" />
      </div>
    </div>
  );
}
