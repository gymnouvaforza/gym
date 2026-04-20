// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RegistrationSuccessCard from "@/components/auth/RegistrationSuccessCard";

const replaceMock = vi.fn();
const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe("RegistrationSuccessCard", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "http://localhost:3000/registro/completado");
    replaceMock.mockReset();
    fetchMock.mockReset();
  });

  it("shows the pending state with the registered email", () => {
    render(<RegistrationSuccessCard email="socio@gym.com" status="pending" />);

    expect(screen.getByText("Cuenta creada con exito")).toBeInTheDocument();
    expect(screen.getByText("socio@gym.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reenviar enlace" })).toBeInTheDocument();
  });

  it("shows the confirmed state with a direct path to the private area", () => {
    render(<RegistrationSuccessCard status="confirmed" />);

    expect(screen.getByText("Cuenta confirmada con exito")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a mi cuenta" })).toHaveAttribute(
      "href",
      "/mi-cuenta",
    );
  });

  it("shows the error state without a resend CTA when the email is missing", () => {
    render(<RegistrationSuccessCard status="error" />);

    expect(screen.getByText("No pudimos confirmar tu correo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reenviar enlace" })).not.toBeInTheDocument();
    expect(screen.getByText("Necesitamos tu email para reenviar")).toBeInTheDocument();
  });

  it("resends the confirmation link and updates the URL state", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });
    const user = userEvent.setup();

    render(<RegistrationSuccessCard email="socio@gym.com" status="pending" />);

    await user.click(screen.getByRole("button", { name: "Reenviar enlace" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith(
        "/registro/completado?pending=1&resent=1&email=socio%40gym.com",
      );
    });

    expect(await screen.findByText("Enlace reenviado")).toBeInTheDocument();
  });
});
