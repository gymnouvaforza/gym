import { CheckCircle2, CircleAlert, Info, OctagonAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FeedbackTone = "info" | "success" | "warning" | "error";
export type FeedbackChrome = "admin" | "public";

interface FeedbackCalloutProps {
  chrome: FeedbackChrome;
  tone?: FeedbackTone;
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}

const toneConfig = {
  info: {
    icon: Info,
    label: "Info",
    admin: {
      shell: "border-black/10 bg-info-bg",
      icon: "border-black/8 bg-white text-muted-foreground",
      pill: "border-black/10 bg-white text-muted-foreground",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
    public: {
      shell: "border-black/10 bg-info-bg",
      rail: "bg-muted-foreground/30",
      icon: "text-muted-foreground",
      eyebrow: "text-muted-foreground",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
  },
  success: {
    icon: CheckCircle2,
    label: "OK",
    admin: {
      shell: "border-emerald-200 bg-success-bg",
      icon: "border-emerald-200 bg-white text-success",
      pill: "border-emerald-200 bg-white text-success",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
    public: {
      shell: "border-emerald-200 bg-success-bg",
      rail: "bg-success",
      icon: "text-success",
      eyebrow: "text-success",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
  },
  warning: {
    icon: CircleAlert,
    label: "Aviso",
    admin: {
      shell: "border-amber-200 bg-warning-bg",
      icon: "border-amber-200 bg-white text-warning",
      pill: "border-amber-200 bg-white text-warning",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
    public: {
      shell: "border-amber-200 bg-warning-bg",
      rail: "bg-warning",
      icon: "text-warning",
      eyebrow: "text-warning",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
  },
  error: {
    icon: OctagonAlert,
    label: "Error",
    admin: {
      shell: "border-primary/15 bg-error-bg",
      icon: "border-primary/15 bg-white text-primary",
      pill: "border-primary/15 bg-white text-primary",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
    public: {
      shell: "border-primary/15 bg-error-bg",
      rail: "bg-primary",
      icon: "text-primary",
      eyebrow: "text-primary",
      title: "text-foreground",
      message: "text-muted-foreground",
    },
  },
} as const;

export default function FeedbackCallout({
  chrome,
  tone = "warning",
  title,
  message,
  actionLabel,
  actionHref,
  compact = false,
  className,
  children,
}: Readonly<FeedbackCalloutProps>) {
  const config = toneConfig[tone];
  const Icon = config.icon;
  const role = tone === "error" ? "alert" : "status";
  const live = tone === "error" ? "assertive" : "polite";

  if (chrome === "admin") {
    return (
      <div
        role={role}
        aria-live={live}
        className={cn(
          "border px-4 py-4",
          compact ? "py-3" : "py-4",
          config.admin.shell,
          className,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center border",
              config.admin.icon,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
                  config.admin.pill,
                )}
              >
                {config.label}
              </span>
              {title ? (
                <p className={cn("text-sm font-bold", config.admin.title)}>{title}</p>
              ) : null}
            </div>
            <p className={cn("text-sm leading-6", config.admin.message)}>{message}</p>
            {children ? <div className="pt-1">{children}</div> : null}
          </div>
          {actionLabel && actionHref ? (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      role={role}
      aria-live={live}
      className={cn(
        "relative overflow-hidden border px-5 py-4",
        compact ? "py-3" : "py-4",
        config.public.shell,
        className,
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1.5", config.public.rail)} />
      <div className="flex items-start gap-4 pl-2">
        <div className={cn("mt-0.5 shrink-0", config.public.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <p
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                config.public.eyebrow,
              )}
            >
              {config.label}
            </p>
            {title ? (
              <p className={cn("text-sm font-bold leading-tight", config.public.title)}>
                {title}
              </p>
            ) : null}
          </div>
          <p className={cn("text-sm leading-6", config.public.message)}>{message}</p>
          {children ? <div className="pt-1">{children}</div> : null}
          {actionLabel && actionHref ? (
            <div className="pt-1">
              <Button asChild variant="ghost" size="sm" className="px-0 text-[11px] font-black uppercase">
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
