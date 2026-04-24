"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildMemberRegistrationCompleteUrl,
} from "@/lib/member-auth-flow";

const VERIFICATION_EMAIL_COOLDOWN_SECONDS = 45;

type RegistrationStatus = "pending" | "confirmed" | "error";

interface RegistrationSuccessCardProps {
  email?: string | null;
  resent?: boolean;
  status?: RegistrationStatus;
}

function getStatusCopy(status: RegistrationStatus) {
  if (status === "confirmed") {
    return {
      description: "Tu correo ya fue confirmado. La cuenta esta lista para entrar en tu espacio privado.",
      panelBody: "La activacion se completo correctamente. Ya puedes acceder al area privada del gimnasio.",
      panelEyebrow: "Estado de la cuenta",
      panelTitle: "Cuenta confirmada",
      title: "Cuenta confirmada con exito",
    };
  }

  if (status === "error") {
    return {
      description: "No pudimos validar el enlace. Puede haber caducado o ya no ser valido.",
      panelBody: "Si sigues con el mismo email, te enviamos otro enlace y vuelves a intentarlo sin crear otra cuenta.",
      panelEyebrow: "Estado del enlace",
      panelTitle: "Enlace no valido o caducado",
      title: "No pudimos confirmar tu correo",
    };
  }

  return {
    description: "Ya hemos preparado tu acceso. El siguiente paso es confirmar tu correo para activar la cuenta.",
    panelBody: "Busca el correo de confirmacion, abre el enlace y despues podras entrar con normalidad.",
    panelEyebrow: "Email registrado",
    panelTitle: "Revisa tu bandeja de entrada",
    title: "Cuenta creada con exito",
  };
}

export default function RegistrationSuccessCard({
  email = null,
  resent = false,
  status = "pending",
}: Readonly<RegistrationSuccessCardProps>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<RegistrationStatus>(status);
  const [hasResent, setHasResent] = useState(resent);
  const cooldownIntervalRef = useRef<number | null>(null);

  const copy = useMemo(() => getStatusCopy(currentStatus), [currentStatus]);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current !== null) {
        window.clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  async function handleVerificationRetry() {
    if (!email || isSendingEmail || secondsLeft > 0) {
      return;
    }

    setError(null);
    setIsSendingEmail(true);

    try {
      const response = await fetch("/api/auth/email-verification", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          next: buildMemberRegistrationCompleteUrl({
            confirmed: true,
          }),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "No pudimos reenviar el enlace.");
        return;
      }

      setCurrentStatus("pending");
      setHasResent(true);
      setSecondsLeft(VERIFICATION_EMAIL_COOLDOWN_SECONDS);

      if (cooldownIntervalRef.current !== null) {
        window.clearInterval(cooldownIntervalRef.current);
      }

      cooldownIntervalRef.current = window.setInterval(() => {
        setSecondsLeft((current) => {
          if (current <= 1) {
            if (cooldownIntervalRef.current !== null) {
              window.clearInterval(cooldownIntervalRef.current);
              cooldownIntervalRef.current = null;
            }
            return 0;
          }

          return current - 1;
        });
      }, 1000);

      router.replace(
        buildMemberRegistrationCompleteUrl({
          email,
          pending: true,
          resent: true,
        }),
      );
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-none border border-black/8 bg-[#fbfbf8] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a7f87]">
            {copy.panelEyebrow}
          </p>
          <p className="mt-2 text-lg font-semibold text-[#111111]">{email ?? copy.panelTitle}</p>
          <p className="mt-3 text-sm leading-7 text-[#5f6368]">{copy.panelBody}</p>
        </div>

        {hasResent ? (
          <PublicInlineAlert
            tone="success"
            title="Enlace reenviado"
            message="Te hemos enviado un nuevo enlace de confirmacion. Revisa la bandeja principal y spam."
            compact
          />
        ) : null}

        {error ? (
          <PublicInlineAlert
            tone="error"
            title="No pudimos reenviar el enlace"
            message={error}
            compact
          />
        ) : null}

        {secondsLeft > 0 ? (
          <div className="rounded-none border border-[#d71920]/12 bg-[#fff5f5] p-5 text-sm leading-7 text-[#5f6368]">
            Puedes pedir otro enlace en <strong className="text-[#111111]">{secondsLeft}</strong>{" "}
            segundos.
          </div>
        ) : null}

        {currentStatus === "confirmed" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/mi-cuenta">Ir a mi cuenta</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={email ? `/acceso?confirmed=1&email=${encodeURIComponent(email)}` : "/acceso?confirmed=1"}>
                Acceder
              </Link>
            </Button>
          </div>
        ) : null}

        {currentStatus === "pending" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={handleVerificationRetry} disabled={!email || isSendingEmail || secondsLeft > 0}>
              {isSendingEmail ? "Reenviando enlace" : "Reenviar enlace"}
            </Button>
            <Button asChild variant="outline">
              <Link href={email ? `/acceso?email=${encodeURIComponent(email)}` : "/acceso"}>Ir a acceso</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </div>
        ) : null}

        {currentStatus === "error" ? (
          <div className="space-y-4">
            {!email ? (
              <PublicInlineAlert
                tone="warning"
                title="Necesitamos tu email para reenviar"
                message="Vuelve al registro, escribe tu correo de nuevo y desde ahi podras pedir otro enlace sin problemas."
                compact
              />
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              {email ? (
                <Button onClick={handleVerificationRetry} disabled={isSendingEmail || secondsLeft > 0}>
                  {isSendingEmail ? "Reenviando enlace" : "Reenviar enlace"}
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href={email ? `/registro?email=${encodeURIComponent(email)}` : "/registro"}>
                  Volver al registro
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
