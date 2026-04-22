"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export type HealthStatus = "healthy" | "warning" | "danger" | "neutral"

interface NFCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title?: string
  description?: string
  status?: HealthStatus
  headerActions?: React.ReactNode
  footer?: React.ReactNode
}

const statusStyles: Record<HealthStatus, string> = {
  healthy: "border-emerald-500/10 bg-white shadow-sm hover:shadow-md hover:shadow-emerald-500/5",
  warning: "border-amber-500/10 bg-white shadow-sm hover:shadow-md hover:shadow-amber-500/5",
  danger: "border-red-500/10 bg-white shadow-sm hover:shadow-md hover:shadow-red-500/5",
  neutral: "border-black/5 bg-white shadow-sm hover:shadow-md hover:shadow-black/5"
}

export function NFCard({
  title,
  description,
  status = "neutral",
  headerActions,
  footer,
  children,
  className,
  ...props
}: NFCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all duration-500 border rounded-2xl", statusStyles[status], className)} {...props}>
      {(title || description || headerActions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6">
          <div className="space-y-1.5">
            {title && <CardTitle className="text-base font-black uppercase tracking-widest text-[#111111]">{title}</CardTitle>}
            {description && <CardDescription className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight">{description}</CardDescription>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </CardHeader>
      )}
      <CardContent className="pb-8">{children}</CardContent>
      {footer && <CardFooter className="bg-black/[0.02] border-t border-black/5 pt-6 pb-6">{footer}</CardFooter>}
    </Card>
  )
}
