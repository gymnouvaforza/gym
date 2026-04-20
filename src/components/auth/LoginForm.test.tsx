// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import LoginForm from "@/components/auth/LoginForm";

const {
  fetchMock,
  pushMock,
  refreshMock,
  signInWithEmailAndPasswordMock,
  syncFirebaseBrowserSessionMock,
} = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  syncFirebaseBrowserSessionMock: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  useSearchParams: () => new URLSearchParams("next=/dashboard"),
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseBrowserAuth: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/firebase/browser-session", () => ({
  syncFirebaseBrowserSession: syncFirebaseBrowserSessionMock,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInWithEmailAndPasswordMock.mockReset();
    syncFirebaseBrowserSessionMock.mockReset();
    fetchMock.mockReset();
  });

  it("renders the access error with alert semantics when auth fails", async () => {
    signInWithEmailAndPasswordMock.mockRejectedValue(new Error("Credenciales no validas."));
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
