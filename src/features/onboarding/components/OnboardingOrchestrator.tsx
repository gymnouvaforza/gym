"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthBlockingState, PendingButtonLabel } from "@/components/ui/loading-state";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { useOnboardingForm } from "../hooks/use-onboarding-form";
import { IdentityFields } from "./IdentityFields";

export function OnboardingOrchestrator() {
  const { form, onSubmit, error, isLoading } = useOnboardingForm();

  return (
    <div className="w-full max-w-xl">
      {isLoading && (
        <AuthBlockingState 
          title="Creando tu cuenta" 
          body="Estamos preparando tu acceso como socio de Nova Forza..." 
        />
      )}

      <Card className="border-none shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-display text-3xl font-black uppercase italic tracking-tighter">
            Unite a Nova Forza
          </CardTitle>
          <CardDescription>
            Completa tus datos para activar tu acceso web y gestionar tus membresias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-8">
              {error && <PublicInlineAlert tone="error" message={error} />}
              
              <IdentityFields />

              <Button 
                type="submit" 
                className="btn-athletic btn-primary w-full py-6 text-lg"
                disabled={isLoading}
              >
                <PendingButtonLabel pending={isLoading} pendingLabel="Procesando...">
                  Finalizar Registro
                </PendingButtonLabel>
              </Button>

              <p className="px-8 text-center text-xs leading-6 text-muted-foreground">
                Al registrarte, aceptas nuestros{" "}
                <a href="/terminos" className="underline underline-offset-4 hover:text-primary">
                  Terminos de Servicio
                </a>{" "}
                y{" "}
                <a href="/privacidad" className="underline underline-offset-4 hover:text-primary">
                  Politica de Privacidad
                </a>.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
