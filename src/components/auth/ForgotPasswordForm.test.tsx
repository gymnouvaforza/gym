// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const resetPasswordForEmailMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      resetPasswordForEmail: resetPasswordForEmailMock,
    },
  }),
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    resetPasswordForEmailMock.mockReset();
  });

  it("renders the form correctly", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar enlace de recuperacion/i })).toBeInTheDocument();
  });

  it("shows success message after submitting email", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: /Enviar enlace de recuperacion/i }));

    await waitFor(() => {
      expect(resetPasswordForEmailMock).toHaveBeenCalledWith("test@example.com", {
        redirectTo: "http://localhost:3000/auth/confirm?next=%2Factualizar-contrasena",
      });
      expect(screen.getByText("Enlace enviado")).toBeInTheDocument();
      expect(screen.getByText(/recibiras un correo con las instrucciones/i)).toBeInTheDocument();
    });
  });

  it("shows error message if reset fails", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: { message: "Error al enviar el email" } });
    const user = userEvent.setup();

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "fail@example.com");
    await user.click(screen.getByRole("button", { name: /Enviar enlace de recuperacion/i }));

    await waitFor(() => {
      expect(screen.getByText("Error al enviar el email")).toBeInTheDocument();
    });
  });
});
