"use client";

import { Loader2, ShieldCheck, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

function SkeletonBlock({
  className,
}: Readonly<{
  className?: string;
}>) {
  return <div className={cn("animate-pulse rounded-none bg-black/6", className)} />;
}

type SectionSkeletonProps = {
  className?: string;
  lines?: number;
  titleWidthClassName?: string;
};

export function SectionSkeleton({
  className,
  lines = 4,
  titleWidthClassName = "w-36",
}: Readonly<SectionSkeletonProps>) {
  return (
    <div className={cn("rounded-none border border-black/8 bg-white p-6 shadow-sm", className)}>
      <SkeletonBlock className={cn("h-3", titleWidthClassName)} />
      <div className="mt-6 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className={cn("h-3", index === lines - 1 ? "w-1/2" : "w-full")}
          />
        ))}
      </div>
    </div>
  );
}

type RouteSkeletonVariant = "auth" | "public" | "admin";

type RouteSkeletonProps = {
  className?: string;
  title?: string;
  description?: string;
  variant?: RouteSkeletonVariant;
  sections?: number;
};

export function RouteSkeleton({
  className,
  title = "Preparando la vista",
  description = "Estamos cargando el contenido para que puedas continuar sin perder contexto.",
  variant = "public",
  sections = 2,
}: Readonly<RouteSkeletonProps>) {
  if (variant === "auth") {
    return (
      <div className={cn("section-shell flex min-h-screen items-center justify-center py-16", className)}>
        <div className="w-full max-w-md rounded-none border border-black/8 bg-white p-6 shadow-[0_24px_70px_-42px_rgba(17,17,17,0.28)]">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="mt-4 h-8 w-56" />
          <SkeletonBlock className="mt-3 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-4/5" />
          <div className="mt-8 space-y-5">
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-12 w-full" />
            </div>
          </div>
          <SkeletonBlock className="mt-6 h-12 w-full" />
          <p className="mt-5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="flex flex-col gap-4 border-b border-black/5 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-10 w-72" />
            <SkeletonBlock className="h-3 w-full max-w-xl" />
          </div>
          <SkeletonBlock className="h-14 w-full max-w-xs md:w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SectionSkeleton key={index} lines={3} />
          ))}
        </div>
        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <SectionSkeleton lines={7} className="min-h-[320px]" />
          <SectionSkeleton lines={5} className="min-h-[320px]" />
        </div>
      </div>
    );
  }

  return (
    <section className={cn("section-shell py-10 md:py-14", className)}>
      <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-sm sm:p-8">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-4 h-10 w-60 sm:w-80" />
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-6 grid gap-6">
        {Array.from({ length: sections }).map((_, index) => (
          <SectionSkeleton
            key={index}
            lines={index === 0 ? 5 : 6}
            titleWidthClassName={index === 0 ? "w-32" : "w-40"}
          />
        ))}
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
    </section>
  );
}

type AuthBlockingStateProps = {
  body: string;
  className?: string;
  eyebrow?: string;
  title: string;
};

export function AuthBlockingState({
  body,
  className,
  eyebrow = "Validando acceso",
  title,
}: Readonly<AuthBlockingStateProps>) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center bg-secondary/80 p-6 backdrop-blur-md",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md rounded-none border border-white/10 bg-secondary p-6 text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/5">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f3a3a6]">
              {eyebrow}
            </p>
            <h3 className="font-display text-2xl font-black uppercase tracking-tight">{title}</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/72">{body}</p>
        <div className="mt-5 flex items-center gap-3 border-t border-white/8 pt-4 text-[11px] uppercase tracking-[0.18em] text-white/45">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>La sesion ya fue aceptada, falta preparar la siguiente vista.</span>
        </div>
      </div>
    </div>
  );
}

export function MembersTableSkeleton() {
  return (
    <div className="bg-white border border-black/10 shadow-sm overflow-hidden">
      <div className="h-10 bg-black/5 flex items-center px-4 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-2 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-black/5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <SkeletonBlock className="h-10 w-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-1/3" />
              <SkeletonBlock className="h-2 w-1/4" />
            </div>
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

type PendingButtonLabelProps = {
  children: string;
  className?: string;
  icon?: "loader" | "sparkles";
  pending: boolean;
  pendingLabel: string;
};

export function PendingButtonLabel({
  children,
  className,
  icon = "loader",
  pending,
  pendingLabel,
}: Readonly<PendingButtonLabelProps>) {
  const Icon = icon === "sparkles" ? Sparkles : Loader2;

  return (
    <span className={cn("inline-flex items-center justify-center gap-2", className)}>
      {pending ? <Icon className={cn("h-4 w-4", icon === "loader" && "animate-spin")} /> : null}
      <span>{pending ? pendingLabel : children}</span>
    </span>
  );
}
