// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import MemberAuthForm from "@/components/auth/MemberAuthForm";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const signUpMock = vi.fn();
let currentSearchParams = "next=/mi-cuenta";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  useSearchParams: () => new URLSearchParams(currentSearchParams),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
      signUp: signUpMock,
    },
  }),
}));

describe("MemberAuthForm", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "http://localhost:3000/registro");
    currentSearchParams = "next=/mi-cuenta";
    pushMock.mockReset();
    refreshMock.mockReset();
    signInWithPasswordMock.mockReset();
    signUpMock.mockReset();
  });

  it("logs a member in and redirects to the private area", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<MemberAuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "socio@gym.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(signInWithPasswordMock).toHaveBeenCalledWith({
        email: "socio@gym.com",
        password: "secret12",
      });
      expect(pushMock).toHaveBeenCalledWith("/mi-cuenta");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("redirects to the success page when email confirmation is required", async () => {
    signUpMock.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();

    render(<MemberAuthForm mode="register" />);

    await user.type(screen.getByLabelText("Email"), "nuevo@gym.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "nuevo@gym.com",
        password: "secret12",
        options: {
          emailRedirectTo:
            "http://localhost:3000/auth/confirm?next=%2Fregistro%2Fcompletado%3Fconfirmed%3D1",
        },
      });
      expect(pushMock).toHaveBeenCalledWith("/registro/completado?pending=1&email=nuevo%40gym.com");
    });
  });

  it("shows a friendly confirmation message on the login screen", async () => {
    currentSearchParams = "confirmed=1&email=socio@gym.com&next=/mi-cuenta";

    render(<MemberAuthForm mode="login" />);

    expect(await screen.findByText("Correo confirmado")).toBeInTheDocument();
    expect(screen.getByDisplayValue("socio@gym.com")).toBeInTheDocument();
  });

  it("blocks register when the repeated password does not match", async () => {
    const user = userEvent.setup();

    render(<MemberAuthForm mode="register" />);

    await user.type(screen.getByLabelText("Email"), "nuevo@gym.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret99");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Las contrasenas no coinciden.")).toBeInTheDocument();
    expect(signUpMock).not.toHaveBeenCalled();
  });
});
