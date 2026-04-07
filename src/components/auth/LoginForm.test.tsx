// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import LoginForm from "@/components/auth/LoginForm";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  useSearchParams: () => new URLSearchParams("next=/dashboard"),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInWithPasswordMock.mockReset();
    fetchMock.mockReset();
  });

  it("renders the access error with alert semantics when auth fails", async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: "Credenciales no validas." },
    });
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email o usuario"), "admin@gym.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("No se pudo iniciar sesion")).toBeInTheDocument();
      expect(screen.getByText("Credenciales no validas.")).toBeInTheDocument();
    });
  });
});
