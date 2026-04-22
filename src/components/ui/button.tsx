"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-none whitespace-nowrap text-sm font-semibold tracking-[0.08em] transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d71920]/30",
  {
    variants: {
      variant: {
        default:
          "bg-[#d71920] text-white shadow-[0_18px_40px_-22px_rgba(215,25,32,0.55)] hover:bg-[#bf161c] hover:-translate-y-0.5",
        secondary:
          "border border-[#18181b] bg-[#18181b] text-white shadow-[0_18px_45px_-28px_rgba(17,17,17,0.7)] hover:bg-[#27272a] hover:-translate-y-0.5",
        outline:
          "border border-black/12 bg-white text-[#111111] hover:border-[#d71920]/35 hover:bg-[#fff7f7] hover:text-[#111111] hover:-translate-y-0.5",
        ghost: "border border-transparent text-[#4b5563] hover:bg-black/[0.04] hover:text-[#111111]",
        destructive: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        success: "bg-green-600 text-white shadow-[0_18px_40px_-22px_rgba(22,163,74,0.55)] hover:bg-green-700",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  success?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, success, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const currentVariant = success ? "success" : variant;

    return (
      <button
        className={cn(buttonVariants({ variant: currentVariant, size, className }))}
        ref={ref}
        disabled={loading || success || props.disabled}
        {...props}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="sr-only">Cargando</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              <span>Completado</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
