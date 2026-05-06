"use client";

import * as React from "react";
import {
  Database,
  Flame,
  ShoppingBag,
  ShieldCheck,
  Mail,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  checkSupabaseConnection,
  checkFirebaseAdmin,
  checkMedusaStorefront,
  checkMedusaAdmin,
  DiagnosticResult,
} from "@/lib/diagnostics/actions";
import { cn } from "@/lib/utils";

type ServiceStatus = {
  name: string;
  description: string;
  icon: React.ElementType;
  configured: boolean;
  canTest: boolean;
  testAction?: () => Promise<DiagnosticResult>;
  extraInfo?: string;
};

interface DiagnosticsPanelProps {
  initialStatus: {
    supabase: { configured: boolean; serviceRole: boolean };
    firebase: { public: boolean; admin: boolean };
    medusa: { storefront: boolean; admin: boolean };
    smtp: { configured: boolean };
    paypal: { configured: boolean; environment: string | null };
  };
  canRunChecks?: boolean;
}

export default function DiagnosticsPanel({
  initialStatus,
  canRunChecks = true,
}: DiagnosticsPanelProps) {
  const [results, setResults] = React.useState<Record<string, DiagnosticResult | null>>({});
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});

  const services: ServiceStatus[] = [
    {
      name: "Supabase",
      description: "Base de datos de dominio, roles y storage.",
      icon: Database,
      configured: initialStatus.supabase.configured,
      canTest: initialStatus.supabase.serviceRole,
      testAction: checkSupabaseConnection,
      extraInfo: initialStatus.supabase.serviceRole ? "Service Role disponible" : "Falta Service Role",
    },
    {
      name: "Firebase Admin",
      description: "Gestion de identidad y sesiones en servidor.",
      icon: Flame,
      configured: initialStatus.firebase.public,
      canTest: initialStatus.firebase.admin,
      testAction: checkFirebaseAdmin,
      extraInfo: initialStatus.firebase.admin ? "Admin SDK configurado" : "Falta Admin SDK",
    },
    {
      name: "Medusa Storefront",
      description: "API publica de catalogo y carrito.",
      icon: ShoppingBag,
      configured: initialStatus.medusa.storefront,
      canTest: initialStatus.medusa.storefront,
      testAction: checkMedusaStorefront,
    },
    {
      name: "Medusa Admin",
      description: "API administrativa de pedidos y productos.",
      icon: ShieldCheck,
      configured: initialStatus.medusa.admin,
      canTest: initialStatus.medusa.admin,
      testAction: checkMedusaAdmin,
    },
    {
      name: "SMTP",
      description: "Envio de notificaciones por email.",
      icon: Mail,
      configured: initialStatus.smtp.configured,
      canTest: false,
      extraInfo: initialStatus.smtp.configured ? "Configurado (Prueba manual pendiente)" : "No configurado",
    },
    {
      name: "PayPal",
      description: "Pasarela de pagos.",
      icon: CreditCard,
      configured: initialStatus.paypal.configured,
      canTest: false,
      extraInfo: initialStatus.paypal.configured
        ? `Configurado (${initialStatus.paypal.environment})`
        : "No configurado",
    },
  ];

  const handleTest = async (serviceName: string, action: () => Promise<DiagnosticResult>) => {
    setLoading((prev) => ({ ...prev, [serviceName]: true }));
    try {
      const result = await action();
      setResults((prev) => ({ ...prev, [serviceName]: result }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [serviceName]: {
          success: false,
          message: error instanceof Error ? error.message : "Error inesperado",
          timestamp: new Date().toISOString(),
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [serviceName]: false }));
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const result = results[service.name];
        const isLoading = loading[service.name];
        const Icon = service.icon;

        return (
          <Card key={service.name} className="flex flex-col border-black/5 bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-black uppercase tracking-wider">
                  {service.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {service.description}
                </CardDescription>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center bg-black/5 p-2",
                  service.configured ? "text-black" : "text-black/20",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {service.configured ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Configurado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-500">
                      <XCircle className="h-3 w-3" />
                      Falta configuracion
                    </div>
                  )}
                  {service.extraInfo ? (
                    <span className="text-[10px] font-medium text-black/40">
                      - {service.extraInfo}
                    </span>
                  ) : null}
                </div>

                {result ? (
                  <div
                    className={cn(
                      "border-l-2 p-3 text-xs font-medium",
                      result.success
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-red-500 bg-red-50 text-red-800",
                    )}
                  >
                    <p className="line-clamp-3">{result.message}</p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] opacity-70">
                      <Clock className="h-3 w-3" />
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                {service.canTest && service.testAction && canRunChecks ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[10px] font-black uppercase tracking-widest"
                    onClick={() => handleTest(service.name, service.testAction!)}
                    loading={isLoading}
                  >
                    <RefreshCw className={cn("mr-2 h-3 w-3", isLoading && "animate-spin")} />
                    Probar conexion
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase text-black/30">
                    <AlertCircle className="h-3 w-3" />
                    {service.canTest && !canRunChecks ? "Solo superadmin" : "Validacion manual"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
