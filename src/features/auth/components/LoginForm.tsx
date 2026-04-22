"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthBlockingState, PendingButtonLabel } from "@/components/ui/loading-state";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { loginSchema, type LoginValues } from "@/lib/validators/auth";
import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const { login, error, isLoading } = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: "",
      password: "",
    },
  });

  return (
    <div className="relative mx-auto w-full max-w-md">
      {isLoading && (
        <AuthBlockingState 
          title="Iniciando sesion" 
          body="Validando tus credenciales con el servicio de autenticacion..." 
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(login)} className="space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-sm text-muted-foreground">
              Introduce tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {error && <PublicInlineAlert tone="error" message={error} />}

          <FormField
            control={form.control}
            name="identity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email o Usuario</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="nombre@ejemplo.com" 
                    {...field} 
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Contrasena</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contrasena?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    type="password" 
                    {...field} 
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            <PendingButtonLabel pending={isLoading} pendingLabel="Entrando...">
              Iniciar Sesion
            </PendingButtonLabel>
          </Button>

          <div className="text-center text-sm">
            ¿No tienes cuenta?{" "}
            <Link href="/join" className="font-medium text-primary hover:underline">
              Registrate como socio
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
