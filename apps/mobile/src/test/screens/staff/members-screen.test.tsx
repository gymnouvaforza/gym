import { fireEvent, screen } from "@testing-library/react-native";

import StaffMembersScreen from "../../../../app/(staff)/members/index";
import { useStaffMembersQuery } from "@/hooks/use-mobile-queries";
import { createStaffMembersResponse } from "@/test/factories";
import { renderWithProviders } from "@/test/render";

jest.mock("@/hooks/use-mobile-queries", () => ({
  useStaffMembersQuery: jest.fn(),
}));

describe("StaffMembersScreen", () => {
  it("shows an empty state when no members match the query", () => {
    (useStaffMembersQuery as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    });

    renderWithProviders(<StaffMembersScreen />);
    expect(screen.getByText("Lista vacía")).toBeOnTheScreen();
  });

  it("navigates to member detail when a row is pressed", () => {
    const { router } = require("expo-router");
    (useStaffMembersQuery as jest.Mock).mockReturnValue({
      data: createStaffMembersResponse(),
      isLoading: false,
    });

    renderWithProviders(<StaffMembersScreen />);
    fireEvent.press(screen.getByText("Nova Tester"));

    expect(router.push).toHaveBeenCalledWith("/(staff)/members/member-1");
  });
});
