// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "http://localhost:3000/recuperar-contrasena");
    fetchMock.mockReset();
  });

  it("requests a password reset email through the custom auth route", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "socio@gym.com");
    await user.click(screen.getByRole("button", { name: "Enviar enlace de recuperacion" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/password-reset",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    expect(await screen.findByText("Enlace enviado")).toBeInTheDocument();
  });
});
