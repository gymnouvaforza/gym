"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    // Podríamos loguear el error a un servicio externo aquí
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f0] px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center bg-[#111111]">
        <AlertTriangle className="h-10 w-10 text-[#d71920]" />
      </div>
      
      <h1 className="mt-8 font-display text-4xl font-black uppercase tracking-tight text-[#111111] sm:text-5xl italic">
        Fallo en la <span className="text-[#d71920]">Operación</span>
      </h1>
      
      <p className="mt-6 max-w-md text-sm leading-7 text-[#4b5563]">
        Ha ocurrido un error técnico inesperado. Nuestra infraestructura está bajo mantenimiento o la petición ha excedido el tiempo de espera.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Button
          onClick={() => reset()}
          variant="default"
          className="btn-athletic min-w-[200px]"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reintentar Carga
        </Button>
        <Button
          asChild
          variant="outline"
          className="btn-athletic min-w-[200px]"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Link>
        </Button>
      </div>

      <div className="mt-12 border-t border-black/5 pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111]/30">
          Nova Forza Technical Support
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[9px] text-black/20">
            ID de Referencia: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
