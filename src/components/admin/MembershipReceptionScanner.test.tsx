// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembershipReceptionScanner from "@/components/admin/MembershipReceptionScanner";

const scannerMocks = vi.hoisted(() => {
  let successHandler: ((decodedText: string) => void) | null = null;
  let startImplementation = vi.fn(
    async (
      _cameraConfig: unknown,
      _config: unknown,
      onSuccess: (decodedText: string) => void,
    ) => {
      successHandler = onSuccess;
    },
  );

  const stop = vi.fn(async () => undefined);
  const clear = vi.fn(() => undefined);

  class Html5Qrcode {
    start(
      cameraConfig: unknown,
      config: unknown,
      onSuccess: (decodedText: string) => void,
    ) {
      return startImplementation(cameraConfig, config, onSuccess);
    }

    stop() {
      return stop();
    }

    clear() {
      return clear();
    }
  }

  return {
    Html5Qrcode,
    clear,
    getSuccessHandler: () => successHandler,
    setStartImplementation: (next: typeof startImplementation) => {
      startImplementation = vi.fn(async (cameraConfig, config, onSuccess) => {
        successHandler = onSuccess;
        return next(cameraConfig, config, onSuccess);
      });
    },
    stop,
  };
});

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: scannerMocks.Html5Qrcode,
}));

describe("MembershipReceptionScanner", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    scannerMocks.stop.mockClear();
    scannerMocks.clear.mockClear();
    scannerMocks.setStartImplementation(
      vi.fn(
        async (
          _cameraConfig: unknown,
          _config: unknown,
          onSuccess: (decodedText: string) => void,
        ) => {
          void onSuccess;
        },
      ),
    );
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("starts the camera flow and validates the decoded QR against the internal endpoint", async () => {
    const user = userEvent.setup();
    const onValidationResolved = vi.fn();

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          reasonCode: "ok",
          canEnter: true,
          validationLabel: "Membresia al dia",
          scannedToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
          publicValidationUrl:
            "https://novaforza.pe/validacion/membresia/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
          member: null,
          membershipRequest: null,
          errorMessage: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(<MembershipReceptionScanner onValidationResolved={onValidationResolved} />);

    await user.click(screen.getByRole("button", { name: /abrir camara/i }));

    expect(await screen.findByText(/escaneando/i)).toBeInTheDocument();

    const registeredHandler = scannerMocks.getSuccessHandler();

    if (!registeredHandler) {
      throw new Error("Expected QR success handler to be registered.");
    }

    registeredHandler("ff6ae4fd-b470-4db1-8d47-711fb01eb0a2");

    await waitFor(() => {
      expect(scannerMocks.stop).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/dashboard/membership-qr/validate",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2" }),
        }),
      );
    });

    expect(onValidationResolved).toHaveBeenLastCalledWith(
      expect.objectContaining({
        reasonCode: "ok",
        canEnter: true,
      }),
    );
  });

  it("surfaces camera permission failures without any manual fallback", async () => {
    const user = userEvent.setup();
    scannerMocks.setStartImplementation(
      vi.fn(async () => {
        throw new Error("Permiso de camara denegado");
      }),
    );

    render(<MembershipReceptionScanner />);

    await user.click(screen.getByRole("button", { name: /abrir camara/i }));

    expect(await screen.findByText("No pudimos usar la camara")).toBeInTheDocument();
    expect(screen.getAllByText(/permiso de camara denegado/i)).toHaveLength(2);
    expect(screen.queryByText(/fallback manual/i)).not.toBeInTheDocument();
  });

  it("returns an explicit error result when the dashboard cannot validate the QR", async () => {
    const user = userEvent.setup();
    const onValidationResolved = vi.fn();

    fetchMock.mockRejectedValue(new Error("Supabase no responde"));

    render(<MembershipReceptionScanner onValidationResolved={onValidationResolved} />);

    await user.click(screen.getByRole("button", { name: /abrir camara/i }));

    const registeredHandler = scannerMocks.getSuccessHandler();

    if (!registeredHandler) {
      throw new Error("Expected QR success handler to be registered.");
    }

    registeredHandler("ff6ae4fd-b470-4db1-8d47-711fb01eb0a2");

    await waitFor(() => {
      expect(onValidationResolved).toHaveBeenLastCalledWith(
        expect.objectContaining({
          reasonCode: "server_error",
          status: "error",
        }),
      );
    });

    expect(screen.getByText(/la validacion fallo/i)).toBeInTheDocument();
  });
});
