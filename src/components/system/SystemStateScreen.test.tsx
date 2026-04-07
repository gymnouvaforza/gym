// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import SystemStateScreen from "@/components/system/SystemStateScreen";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/content/SimpleMarkdown", () => ({
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));

describe("SystemStateScreen", () => {
  it("renders the public alert language and the cms actions", () => {
    const onReset = vi.fn();

    render(
      <SystemStateScreen
        document={{
          key: "system-error-access",
          slug: "error-acceso",
          title: "Acceso restringido",
          summary: "Necesitas iniciar sesion para continuar.",
          body_markdown: "Contacta con el club si crees que esto es un error.",
          cta_label: "Volver al inicio",
          cta_href: "/",
        } as never}
        resetLabel="Reintentar acceso"
        onReset={onReset}
      />,
    );

    expect(screen.getByText("Acceso restringido")).toBeInTheDocument();
    expect(
      screen.getByText("Necesitas iniciar sesion para continuar."),
    ).toBeInTheDocument();
    expect(screen.getByText("Contacta con el club si crees que esto es un error.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar acceso/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver al inicio/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
