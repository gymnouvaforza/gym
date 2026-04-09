"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el sidebar cuando cambia la ruta
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setOpen(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className="xl:hidden">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="flex h-10 w-10 items-center justify-center bg-black text-white hover:bg-black/80 transition-colors shadow-lg active:scale-95">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú lateral</span>
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content 
            className="fixed inset-y-0 left-0 z-[70] h-full w-[304px] bg-[#111111] shadow-2xl transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300 sm:max-w-sm"
          >
            <Dialog.Title className="sr-only">Navegación del Dashboard</Dialog.Title>
            <div className="relative h-full flex flex-col">
              <div className="absolute right-4 top-8 z-[80]">
                <Dialog.Close asChild>
                  <button className="flex h-10 w-10 items-center justify-center bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all rounded-none">
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <DashboardSidebar />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
