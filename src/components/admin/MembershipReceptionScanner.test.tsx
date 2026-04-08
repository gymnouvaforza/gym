// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MembershipReceptionScanner from "@/components/admin/MembershipReceptionScanner";

const navigationMocks = vi.hoisted(() => ({
  pathname: "/dashboard/membresias/recepcion",
  replace: vi.fn(),
}));

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

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({
    replace: navigationMocks.replace,
  }),
}));

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: scannerMocks.Html5Qrcode,
}));

describe("MembershipReceptionScanner", () => {
  beforeEach(() => {
    navigationMocks.replace.mockReset();
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
  });

  it("resolves a manual token or URL through the current reception route", async () => {
    const user = userEvent.setup();
    render(<MembershipReceptionScanner initialValue="" />);

    await user.type(
      screen.getByPlaceholderText(/validacion\/membresia/i),
      "https://club.test/validacion/membresia/qr_token_12345",
    );
    await user.click(screen.getByRole("button", { name: /resolver qr/i }));

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        "/dashboard/membresias/recepcion?token=https%3A%2F%2Fclub.test%2Fvalidacion%2Fmembresia%2Fqr_token_12345",
      );
    });
  });

  it("shows a validation hint when the manual fallback is empty", async () => {
    const user = userEvent.setup();
    render(<MembershipReceptionScanner initialValue="" />);

    await user.click(screen.getByRole("button", { name: /resolver qr/i }));

    expect(
      screen.getByText("Pega un token o una URL valida antes de continuar."),
    ).toBeInTheDocument();
    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });

  it("starts the camera flow and routes when a QR is decoded", async () => {
    const user = userEvent.setup();
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

    render(<MembershipReceptionScanner initialValue="" />);

    await user.click(screen.getByRole("button", { name: /activar camara/i }));

    expect(screen.getByText(/camara lista/i)).toBeInTheDocument();

    const registeredHandler = scannerMocks.getSuccessHandler();

    if (!registeredHandler) {
      throw new Error("Expected QR success handler to be registered.");
    }

    registeredHandler("qr_token_camera");

    await waitFor(() => {
      expect(scannerMocks.stop).toHaveBeenCalled();
      expect(navigationMocks.replace).toHaveBeenCalledWith(
        "/dashboard/membresias/recepcion?token=qr_token_camera",
      );
    });
  });

  it("falls back gracefully when the camera cannot be opened", async () => {
    const user = userEvent.setup();
    scannerMocks.setStartImplementation(
      vi.fn(async () => {
        throw new Error("Permiso de camara denegado");
      }),
    );

    render(<MembershipReceptionScanner initialValue="" />);

    await user.click(screen.getByRole("button", { name: /activar camara/i }));

    expect(await screen.findByText("No pudimos usar la camara")).toBeInTheDocument();
    expect(screen.getByText(/permiso de camara denegado/i)).toBeInTheDocument();
  });

  it("clears the current token from the reception route", async () => {
    const user = userEvent.setup();
    render(<MembershipReceptionScanner initialValue="qr_token_existing" />);

    await user.click(screen.getByRole("button", { name: /limpiar lectura/i }));

    await waitFor(() => {
      expect(navigationMocks.replace).toHaveBeenCalledWith("/dashboard/membresias/recepcion");
    });
  });
});
