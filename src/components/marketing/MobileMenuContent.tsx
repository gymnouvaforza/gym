"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SiteHeaderAuthActions from "@/components/marketing/SiteHeaderAuthActions";
import type { SystemModuleStateMap } from "@/lib/module-flags";
import type { SiteSettings } from "@/lib/supabase/database.types";

interface MobileMenuContentProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  activeModules: SystemModuleStateMap;
  navItems: { label: string; href: string }[];
}

export default function MobileMenuContent({
  isOpen,
  onClose,
  settings,
  activeModules,
  navItems,
}: Readonly<MobileMenuContentProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed bottom-0 right-0 top-0 z-[110] flex w-[min(20rem,85vw)] flex-col border-l border-border bg-background shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border/50 p-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                Menu
              </span>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-foreground/60 hover:text-foreground"
              >
                <div className="relative h-6 w-6">
                  <span className="absolute left-0 top-1/2 h-0.5 w-full rotate-45 bg-current" />
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -rotate-45 bg-current" />
                </div>
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto p-6">
              <div className="mb-8 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center justify-between border-b border-border/50 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-foreground last:border-0"
                  >
                    {item.label}
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="h-1.5 w-1.5 rounded-none bg-primary"
                    />
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-6">
                <SiteHeaderAuthActions
                  primaryLabel={settings.hero_primary_cta}
                  mode="mobile"
                />
                {activeModules.tienda ? (
                  <div className="border-t border-border/50 pt-6">
                    <Link
                      href="/carrito"
                      onClick={onClose}
                      className="block w-full rounded-[var(--radius-base)] border-2 border-primary/20 bg-primary/5 py-4 text-center text-[11px] font-black uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-primary hover:text-white"
                    >
                      Ver carrito
                    </Link>
                  </div>
                ) : null}
                <div className="pb-4 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                    {settings.site_name} &copy; {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
