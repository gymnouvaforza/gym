"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, Check } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-none whitespace-nowrap text-sm font-semibold tracking-[0.08em] transition-all duration-300 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_18px_40px_-22px_rgba(215,25,32,0.55)] hover:bg-brand-primary-hover hover:-translate-y-0.5",
        secondary:
          "border border-secondary bg-secondary text-secondary-foreground shadow-[0_18px_45px_-28px_rgba(17,17,17,0.7)] hover:bg-brand-secondary-hover hover:-translate-y-0.5",
        outline:
          "border border-black/12 bg-white text-foreground hover:border-primary/35 hover:bg-error-bg hover:text-foreground hover:-translate-y-0.5",
        ghost: "border border-transparent text-muted-foreground hover:bg-black/[0.04] hover:text-foreground",
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
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="sr-only">Cargando</span>
            </div>
          ) : success ? (
            <div className="flex items-center gap-2 animate-in zoom-in duration-200">
              <Check className="h-4 w-4" />
              <span>Completado</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              {children}
            </div>
          )}
        </div>
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
