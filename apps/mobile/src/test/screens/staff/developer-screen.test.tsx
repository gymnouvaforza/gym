import { fireEvent, screen } from "@testing-library/react-native";

import StaffDeveloperScreen from "../../../../app/(staff)/developer";
import { createMobileSession } from "@/test/factories";
import { renderWithProviders } from "@/test/render";

const mockUseSystemModulesQuery = jest.fn();
const mockUseToggleSystemModuleMutation = jest.fn();

jest.mock("@/hooks/use-mobile-queries", () => ({
  useSystemModulesQuery: () => mockUseSystemModulesQuery(),
  useToggleSystemModuleMutation: () => mockUseToggleSystemModuleMutation(),
}));

describe("StaffDeveloperScreen", () => {
  it("renders modules for superadmin and toggles them", () => {
    const mutate = jest.fn((_payload, options) => {
      options?.onSuccess?.({
        item: {
          description: "Storefront pickup y carrito.",
          disabledImpact: "Desactiva /tienda y /carrito.",
          isEnabled: false,
          label: "Tienda",
          name: "tienda",
          updatedAt: "2026-04-22T00:00:00.000Z",
        },
      });
    });

    mockUseSystemModulesQuery.mockReturnValue({
      data: {
        items: [
          {
            description: "Storefront pickup y carrito.",
            disabledImpact: "Desactiva /tienda y /carrito.",
            isEnabled: true,
            label: "Tienda",
            name: "tienda",
            updatedAt: "2026-04-22T00:00:00.000Z",
          },
        ],
      },
      isError: false,
      isLoading: false,
    });
    mockUseToggleSystemModuleMutation.mockReturnValue({
      isPending: false,
      mutate,
    });

    renderWithProviders(<StaffDeveloperScreen />, {
      auth: {
        mobileSession: createMobileSession({
          role: "staff",
          staffAccessLevel: "superadmin",
        }),
      },
    });

    expect(screen.getByText("Kernel mobile")).toBeOnTheScreen();
    expect(screen.getByText("Desactiva /tienda y /carrito.")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Apagar modulo"));

    expect(mutate).toHaveBeenCalledWith(
      {
        isEnabled: false,
        name: "tienda",
      },
      expect.objectContaining({
        onError: expect.any(Function),
        onSuccess: expect.any(Function),
      }),
    );
    expect(screen.getByText("Tienda desactivado correctamente.")).toBeOnTheScreen();
  });
});
