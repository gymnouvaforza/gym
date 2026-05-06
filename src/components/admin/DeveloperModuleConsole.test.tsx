// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DeveloperModuleConsole from "@/components/admin/DeveloperModuleConsole";

const developerConsoleMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  toggleModuleAction: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: developerConsoleMocks.refresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: developerConsoleMocks.toastSuccess,
    error: developerConsoleMocks.toastError,
  },
}));

vi.mock("@/lib/data/modules.actions", () => ({
  toggleModuleAction: developerConsoleMocks.toggleModuleAction,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("DeveloperModuleConsole", () => {
  beforeEach(() => {
    developerConsoleMocks.refresh.mockReset();
    developerConsoleMocks.toggleModuleAction.mockReset();
    developerConsoleMocks.toastSuccess.mockReset();
    developerConsoleMocks.toastError.mockReset();
  });

  it("renders tooltip copy and toggles modules with optimistic success feedback", async () => {
    developerConsoleMocks.toggleModuleAction.mockResolvedValue({ success: true });

    render(
      <DeveloperModuleConsole
        modules={[
          {
            id: 1,
            name: "tienda",
            label: "Tienda",
            description: "Storefront pickup.",
            disabledImpact: "Desactiva /tienda y /carrito.",
            is_enabled: true,
            updated_at: "2026-04-22T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText(/Desactiva \/tienda y \/carrito\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("switch", { name: /Alternar modulo Tienda/i }));

    expect(developerConsoleMocks.toggleModuleAction).toHaveBeenCalledWith("tienda", false);
    await waitFor(() => {
      expect(developerConsoleMocks.toastSuccess).toHaveBeenCalledWith(
        "Tienda desactivado correctamente.",
      );
      expect(developerConsoleMocks.refresh).toHaveBeenCalled();
    });
  });

  it("shows error toast when toggle fails", async () => {
    developerConsoleMocks.toggleModuleAction.mockResolvedValue({
      success: false,
      error: "Fallo de escritura",
    });

    render(
      <DeveloperModuleConsole
        modules={[
          {
            id: 2,
            name: "cms",
            label: "CMS",
            description: "Editor legal.",
            disabledImpact: "Oculta /dashboard/cms.",
            is_enabled: true,
            updated_at: "2026-04-22T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: /Alternar modulo CMS/i }));

    await waitFor(() => {
      expect(developerConsoleMocks.toastError).toHaveBeenCalledWith("Fallo de escritura");
    });
  });

  it("renders read-only state for admin viewers", () => {
    render(
      <DeveloperModuleConsole
        canManage={false}
        modules={[
          {
            id: 3,
            name: "leads",
            label: "Leads",
            description: "CRM base.",
            disabledImpact: "Oculta /dashboard/leads.",
            is_enabled: true,
            updated_at: "2026-04-22T00:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText(/Solo lectura para admin/i)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Alternar modulo Leads/i })).toBeDisabled();
  });
});
