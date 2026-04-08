"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Camera, CameraOff, Loader2, QrCode, ScanLine } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import FeedbackCallout from "@/components/ui/feedback-callout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MembershipReceptionScannerProps = {
  initialValue?: string;
};

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

export default function MembershipReceptionScanner({
  initialValue = "",
}: Readonly<MembershipReceptionScannerProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const scannerRegionId = useId().replace(/:/g, "");
  const scannerRef = useRef<ScannerHandle | null>(null);
  const lastScanValueRef = useRef<string | null>(null);
  const [manualValue, setManualValue] = useState(initialValue);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "error">("idle");
  const [scannerMessage, setScannerMessage] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isRouting, startRouting] = useTransition();

  useEffect(() => {
    setManualValue(initialValue);
  }, [initialValue]);

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

  function navigateWithToken(rawValue: string) {
    const resolved = rawValue.trim();

    startRouting(() => {
      const nextUrl = resolved
        ? `${pathname}?token=${encodeURIComponent(resolved)}`
        : pathname;
      router.replace(nextUrl);
    });
  }

  async function stopCamera() {
    const scanner = scannerRef.current;

    if (!scanner) {
      setCameraState("idle");
      return;
    }

    try {
      await scanner.stop();
    } catch {
      // Ignore stop race conditions from the scanner library.
    }

    try {
      await Promise.resolve(scanner.clear());
    } catch {
      // Ignore cleanup failures.
    }

    scannerRef.current = null;
    setCameraState("idle");
    setScannerMessage("Camara detenida. Puedes reactivarla cuando quieras.");
  }

  async function startCamera() {
    if (cameraState === "starting" || cameraState === "live") {
      return;
    }

    setScannerError(null);
    setScannerMessage("Activando camara trasera para escaneo continuo...");
    setCameraState("starting");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(scannerRegionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        async (decodedText) => {
          if (!decodedText.trim() || lastScanValueRef.current === decodedText) {
            return;
          }

          lastScanValueRef.current = decodedText;
          setScannerMessage("QR detectado. Abriendo validacion operativa...");

          await stopCamera();
          navigateWithToken(decodedText);
        },
        () => undefined,
      );

      setCameraState("live");
      setScannerMessage("Camara lista. Enfoca el QR del socio para abrir su ficha.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo acceder a la camara en este dispositivo.";

      setCameraState("error");
      setScannerError(message);
      setScannerMessage(null);
    }
  }

  function handleManualSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!manualValue.trim()) {
      setScannerError("Pega un token o una URL valida antes de continuar.");
      return;
    }

    setScannerError(null);
    setScannerMessage("Resolviendo QR manual...");
    navigateWithToken(manualValue);
  }

  return (
    <div className="space-y-5">
      <div className="border border-black/10 bg-[#111111] p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-[#d71920]">
            <ScanLine className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d71920]">
              Recepcion en vivo
            </p>
            <h3 className="text-lg font-black uppercase tracking-tight">
              Escanea el QR del socio
            </h3>
            <p className="text-sm leading-6 text-white/70">
              Usa la camara del movil o tablet del staff. Si el navegador falla, pega la URL o el
              token manualmente y el panel resolvera la ficha igual.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border border-black/10 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={startCamera}
            disabled={cameraState === "starting" || cameraState === "live" || isRouting}
            className="sm:flex-1"
          >
            {cameraState === "starting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activando camara
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Activar camara
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void stopCamera()}
            disabled={cameraState !== "live"}
            className="sm:flex-1"
          >
            <CameraOff className="h-4 w-4" />
            Detener camara
          </Button>
        </div>

        <div
          id={scannerRegionId}
          className="min-h-[280px] border border-dashed border-black/10 bg-[#fbfbf8]"
        />

        {scannerMessage ? (
          <FeedbackCallout chrome="admin" tone="info" message={scannerMessage} compact />
        ) : null}

        {scannerError ? (
          <FeedbackCallout
            chrome="admin"
            tone="warning"
            title="No pudimos usar la camara"
            message={scannerError}
            compact
          />
        ) : null}
      </div>

      <form onSubmit={handleManualSubmit} className="space-y-4 border border-black/10 bg-white p-5 shadow-sm">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d71920]">
            Fallback manual
          </p>
          <h3 className="text-lg font-black uppercase tracking-tight text-[#111111]">
            Pega la URL o el token
          </h3>
        </div>

        <Input
          value={manualValue}
          onChange={(event) => setManualValue(event.target.value)}
          placeholder="https://.../validacion/membresia/TOKEN o TOKEN puro"
          autoComplete="off"
          spellCheck={false}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={isRouting} className="sm:flex-1">
            {isRouting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Abriendo ficha
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                Resolver QR
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setManualValue("");
              setScannerError(null);
              setScannerMessage(null);
              navigateWithToken("");
            }}
            className="sm:flex-1"
          >
            Limpiar lectura
          </Button>
        </div>
      </form>
    </div>
  );
}
