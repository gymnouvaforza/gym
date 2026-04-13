"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { buildMemberPasswordUpdateRedirectUrl } from "@/lib/member-auth-flow";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Introduce un email valido."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [success, setSuccess] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setError(null);
    setIsNavigating(false);
    setSuccess(false);

    const supabase = createSupabaseBrowserClient();
    const redirectTo = buildMemberPasswordUpdateRedirectUrl(window.location.origin);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Enlace enviado</CardTitle>
          <CardDescription>
            Ya hemos procesado tu solicitud. El siguiente paso es revisar tu correo para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-none border border-black/8 bg-[#fbfbf8] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
              Email de recuperacion
            </p>
            <p className="mt-2 text-lg font-semibold text-[#111111]">{form.getValues("email")}</p>
            <p className="mt-3 text-sm leading-7 text-[#5f6368]">
              Si existe una cuenta asociada a este email, recibiras un correo con las instrucciones para recuperar tu contrasena. Revisa la bandeja de entrada y spam.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/acceso">Volver al acceso</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      {form.formState.isSubmitting || isNavigating ? (
        <AuthBlockingState
          eyebrow="Recuperacion"
          title="Buscando tu cuenta"
          body="Estamos validando el email para enviarte el enlace de recuperacion de forma segura."
        />
      ) : null}
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar contrasena</CardTitle>
          <CardDescription>
            Introduce tu email y te enviaremos un enlace para que puedas elegir una nueva contrasena.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? (
                <PublicInlineAlert
                  tone="error"
                  title="No pudimos procesar tu solicitud"
                  message={error}
                  compact
                />
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting || isNavigating}
              >
                <PendingButtonLabel
                  pending={form.formState.isSubmitting || isNavigating}
                  pendingLabel="Enviando enlace"
                >
                  Enviar enlace de recuperacion
                </PendingButtonLabel>
              </Button>
            </form>
          </Form>

          <p className="mt-5 text-center text-sm text-[#5f6368]">
            Ya recordaste tu contrasena?{" "}
            <Link href="/acceso" className="font-semibold text-[#d71920]">
              Inicia sesion aqui
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
