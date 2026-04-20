// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import MemberAuthForm from "@/components/auth/MemberAuthForm";

const {
  clearFirebaseBrowserSessionMock,
  createUserWithEmailAndPasswordMock,
  fetchMock,
  pushMock,
  refreshMock,
  signInWithEmailAndPasswordMock,
  signOutMock,
  syncFirebaseBrowserSessionMock,
} = vi.hoisted(() => ({
  clearFirebaseBrowserSessionMock: vi.fn(),
  createUserWithEmailAndPasswordMock: vi.fn(),
  fetchMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  signInWithEmailAndPasswordMock: vi.fn(),
  signOutMock: vi.fn(),
  syncFirebaseBrowserSessionMock: vi.fn(),
}));
let currentSearchParams = "next=/mi-cuenta";

vi.stubGlobal("fetch", fetchMock);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  useSearchParams: () => new URLSearchParams(currentSearchParams),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
  signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
  signOut: signOutMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseBrowserAuth: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/firebase/browser-session", () => ({
  clearFirebaseBrowserSession: clearFirebaseBrowserSessionMock,
  syncFirebaseBrowserSession: syncFirebaseBrowserSessionMock,
}));

describe("MemberAuthForm", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "http://localhost:3000/registro");
    currentSearchParams = "next=/mi-cuenta";
    pushMock.mockReset();
    refreshMock.mockReset();
    createUserWithEmailAndPasswordMock.mockReset();
    signInWithEmailAndPasswordMock.mockReset();
    signOutMock.mockReset();
    syncFirebaseBrowserSessionMock.mockReset();
    clearFirebaseBrowserSessionMock.mockReset();
    fetchMock.mockReset();
  });

  it("logs a member in and redirects to the private area", async () => {
    signInWithEmailAndPasswordMock.mockResolvedValue({
      user: {
        emailVerified: true,
      },
    });
    const user = userEvent.setup();

    render(<MemberAuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "socio@gym.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith({}, "socio@gym.com", "secret12");
      expect(pushMock).toHaveBeenCalledWith("/mi-cuenta");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("redirects to the success page when email confirmation is required", async () => {
    createUserWithEmailAndPasswordMock.mockResolvedValue({});
    signOutMock.mockResolvedValue(undefined);
    clearFirebaseBrowserSessionMock.mockResolvedValue(undefined);
    syncFirebaseBrowserSessionMock.mockResolvedValue(undefined);
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    const user = userEvent.setup();

    render(<MemberAuthForm mode="register" />);

    await user.type(screen.getByLabelText("Email"), "nuevo@gym.com");
    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(createUserWithEmailAndPasswordMock).toHaveBeenCalledWith({}, "nuevo@gym.com", "secret12");
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
    expect(createUserWithEmailAndPasswordMock).not.toHaveBeenCalled();
  });
});
