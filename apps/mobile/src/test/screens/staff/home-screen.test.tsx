import { screen } from "@testing-library/react-native";

import StaffHomeScreen from "../../../../app/(staff)/index";
import { useStaffDashboardQuery } from "@/hooks/use-mobile-queries";
import { createStaffDashboard } from "@/test/factories";
import { renderWithProviders } from "@/test/render";

jest.mock("@/hooks/use-mobile-queries", () => ({
  useStaffDashboardQuery: jest.fn(),
}));

describe("StaffHomeScreen", () => {
  it("renders dashboard metrics and recent activity", () => {
    (useStaffDashboardQuery as jest.Mock).mockReturnValue({
      data: createStaffDashboard(),
      isLoading: false,
    });

    renderWithProviders(<StaffHomeScreen />);

    expect(screen.getByText("Operacion del dia")).toBeOnTheScreen();
    expect(screen.getByText("12")).toBeOnTheScreen();
    expect(screen.getByText("Nova Tester")).toBeOnTheScreen();
  });
});
