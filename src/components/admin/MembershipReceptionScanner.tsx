"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, QrCode, RotateCcw, ScanLine } from "lucide-react";

import FeedbackCallout from "@/components/ui/feedback-callout";
import { Button } from "@/components/ui/button";
import {
  createMembershipQrErrorResponse,
  isMembershipQrValidationResponse,
  type MembershipQrValidationResponse,
} from "@/lib/membership-qr";

type ScannerHandle = {
  clear: () => Promise<unknown> | unknown;
  start: (
    cameraConfig: string | { facingMode?: string },
    config: { fps: number; qrbox: { width: number; height: number } },
    onSuccess: (decodedText: string) => void,
    onError?: (errorMessage: string) => void,
  ) => Promise<unknown>;
  stop: () => Promise<unknown>;
};

export type MembershipReceptionScannerPhase =
  | "idle"
  | "preparing"
  | "scanning"
  | "validating"
  | "camera_error";

export interface MembershipReceptionScannerState {
  errorMessage: string | null;
  helperMessage: string | null;
  phase: MembershipReceptionScannerPhase;
}

interface MembershipReceptionScannerProps {
  onStateChange?: (state: MembershipReceptionScannerState) => void;
  onValidationResolved?: (result: MembershipQrValidationResponse | null) => void;
}

const DEFAULT_STATE: MembershipReceptionScannerState = {
  phase: "idle",
  helperMessage: "Abre la camara del dispositivo de recepcion para empezar a escanear.",
  errorMessage: null,
};

export default function MembershipReceptionScanner({
  onStateChange,
  onValidationResolved,
}: Readonly<MembershipReceptionScannerProps>) {
  const scannerRegionId = useId().replace(/:/g, "");
  const scannerRef = useRef<ScannerHandle | null>(null);
  const lastScanValueRef = useRef<string | null>(null);
  const [state, setState] = useState<MembershipReceptionScannerState>(DEFAULT_STATE);
  const [hasResolvedScan, setHasResolvedScan] = useState(false);

  useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (!scanner) {
        return;
      }

      void scanner
        .stop()
        .catch(() => undefined)
        .finally(() => {
          try {
            void Promise.resolve(scanner.clear()).catch(() => undefined);
          } catch {
            // Ignore cleanup failures on unmount.
          }
        });
    };
  }, []);

  function publishState(next: MembershipReceptionScannerState) {
    setState(next);
  }

  async function stopCamera(options?: {
    clearMessage?: boolean;
  }) {
    const scanner = scannerRef.current;

    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // Ignore stop race conditions from the scanner library.
      }

      try {
        await Promise.resolve(scanner.clear());
      } catch {
        // Ignore cleanup failures from the scanner library.
      }
    }

    scannerRef.current = null;

    publishState({
      phase: "idle",
      errorMessage: null,
      helperMessage: options?.clearMessage
        ? DEFAULT_STATE.helperMessage
        : "Camara detenida. Cuando quieras, puedes escanear otro QR.",
    });
  }

  async function validateScannedValue(decodedText: string) {
    publishState({
      phase: "validating",
      errorMessage: null,
      helperMessage: "QR detectado. Validando acceso operativo...",
    });
    setHasResolvedScan(false);
    onValidationResolved?.(null);

    try {
      const response = await fetch("/api/dashboard/membership-qr/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scannedValue: decodedText,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!isMembershipQrValidationResponse(payload)) {
        throw new Error("La app no pudo interpretar la respuesta de validacion QR.");
      }

      onValidationResolved?.(payload);
      setHasResolvedScan(true);
      publishState({
        phase: "idle",
        errorMessage: payload.status === "error" ? payload.errorMessage : null,
        helperMessage: payload.canEnter
          ? "Acceso validado. Ya puedes escanear otra membresia."
          : "Validacion terminada. Revisa el estado en el panel lateral.",
      });
    } catch (error) {
      const fallback = createMembershipQrErrorResponse({
        errorMessage:
          error instanceof Error
            ? error.message
            : "No pudimos completar la validacion QR desde el dashboard.",
      });

      onValidationResolved?.(fallback);
      setHasResolvedScan(true);
      publishState({
        phase: "idle",
        errorMessage: fallback.errorMessage,
        helperMessage: "La validacion fallo. Puedes reintentar el escaneo.",
      });
    }
  }

  async function startCamera() {
    if (state.phase === "preparing" || state.phase === "scanning" || state.phase === "validating") {
      return;
    }

    onValidationResolved?.(null);
    setHasResolvedScan(false);
    lastScanValueRef.current = null;
    publishState({
      phase: "preparing",
      errorMessage: null,
      helperMessage: "Preparando camara trasera para recepcion...",
    });

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(scannerRegionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          if (!decodedText.trim() || lastScanValueRef.current === decodedText) {
            return;
          }

          lastScanValueRef.current = decodedText;

          void stopCamera({ clearMessage: true }).then(() => validateScannedValue(decodedText));
        },
        () => undefined,
      );

      publishState({
        phase: "scanning",
        errorMessage: null,
        helperMessage: "Enfoca el QR dentro del recuadro. El acceso se validara en cuanto lo lea.",
      });
    } catch (error) {
      publishState({
        phase: "camera_error",
        errorMessage:
          error instanceof Error
            ? error.message
            : "No se pudo acceder a la camara en este dispositivo.",
        helperMessage: null,
      });
    }
  }

  const isBusy =
    state.phase === "preparing" || state.phase === "scanning" || state.phase === "validating";

  return (
    <div className="space-y-5">
      <div className="border border-black/10 bg-[#111111] p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-[#d71920]">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d71920]">
              Recepcion movil
            </p>
            <h3 className="text-lg font-black uppercase tracking-tight">
              Escaneo directo por camara
            </h3>
            <p className="text-sm leading-6 text-white/70">
              El flujo operativo es solo por camara. Cuando el QR entra en foco, el panel valida en
              vivo si el socio puede pasar o si necesita revision.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => void startCamera()}
            disabled={isBusy}
            className="sm:flex-1"
          >
            {state.phase === "preparing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparando camara
              </>
            ) : state.phase === "validating" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Validando QR
              </>
            ) : state.phase === "camera_error" ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Reintentar camara
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                {hasResolvedScan ? "Escanear otro QR" : "Abrir camara"}
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => void stopCamera()}
            disabled={state.phase !== "scanning" && state.phase !== "preparing"}
            className="sm:flex-1"
          >
            <CameraOff className="h-4 w-4" />
            Cerrar camara
          </Button>
        </div>

        <div className="relative overflow-hidden border border-dashed border-black/10 bg-[#fbfbf8]">
          <div
            id={scannerRegionId}
            className="min-h-[320px] [&_video]:h-[320px] [&_video]:w-full [&_video]:object-cover"
          />

          {state.phase !== "scanning" ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#fbfbf8] px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center border border-black/10 bg-white text-[#d71920]">
                {state.phase === "preparing" || state.phase === "validating" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : state.phase === "camera_error" ? (
                  <CameraOff className="h-6 w-6" />
                ) : (
                  <QrCode className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d71920]">
                  {state.phase === "preparing"
                    ? "Preparando"
                    : state.phase === "validating"
                      ? "Validando"
                      : state.phase === "camera_error"
                        ? "Error de camara"
                        : "Listo"}
                </p>
                <p className="text-base font-bold uppercase tracking-tight text-[#111111]">
                  {state.phase === "preparing"
                    ? "Activando visor trasero"
                    : state.phase === "validating"
                      ? "Comprobando membresia"
                      : state.phase === "camera_error"
                        ? "No pudimos abrir la camara"
                        : "Abre la camara para empezar"}
                </p>
                <p className="mx-auto max-w-sm text-sm leading-6 text-[#5f6368]">
                  {state.errorMessage ?? state.helperMessage ?? DEFAULT_STATE.helperMessage}
                </p>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-x-6 top-6 border border-[#d71920]/20 bg-black/70 px-4 py-3 text-center text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d71920]">
                Escaneando
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                Mantén el QR centrado. El sistema congelará la lectura al primer código válido.
              </p>
            </div>
          )}
        </div>

        {state.helperMessage ? (
          <FeedbackCallout chrome="admin" tone="info" message={state.helperMessage} compact />
        ) : null}

        {state.errorMessage ? (
          <FeedbackCallout
            chrome="admin"
            tone="error"
            title="No pudimos usar la camara"
            message={state.errorMessage}
            compact
          />
        ) : null}
      </div>
    </div>
  );
}
