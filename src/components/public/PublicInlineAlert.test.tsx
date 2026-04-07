// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import PublicInlineAlert from "@/components/public/PublicInlineAlert";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("PublicInlineAlert", () => {
  it("renders a public inline alert without dashboard framing", () => {
    render(
      <PublicInlineAlert
        tone="warning"
        title="Tu cuenta se esta mostrando con contexto parcial"
        message="No se pudo sincronizar toda la informacion."
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Aviso")).toBeInTheDocument();
    expect(
      screen.getByText("Tu cuenta se esta mostrando con contexto parcial"),
    ).toBeInTheDocument();
  });

  it("uses alert semantics for blocking errors and can expose a CTA", () => {
    render(
      <PublicInlineAlert
        tone="error"
        title="Acceso restringido"
        message="Necesitas iniciar sesion para continuar."
        actionLabel="Ir al inicio"
        actionHref="/"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir al inicio/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
