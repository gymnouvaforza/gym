import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AdminSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  inset?: boolean;
  interactive?: boolean;
}

export default function AdminSurface({
  children,
  className,
  inset = false,
  interactive = false,
  ...props
}: Readonly<AdminSurfaceProps>) {
  return (
    <div
      className={cn(
        "rounded-none border border-black/8 bg-white shadow-[0_20px_60px_-40px_rgba(17,17,17,0.25)]",
        inset && "border-black/5 bg-[#fbfbf8] shadow-none",
        interactive && "transition-all duration-300 hover:border-black/15 hover:shadow-[0_24px_70px_-48px_rgba(17,17,17,0.35)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
