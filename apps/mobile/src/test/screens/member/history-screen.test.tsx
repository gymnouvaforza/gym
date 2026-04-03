import { screen } from "@testing-library/react-native";

import MemberHistoryScreen from "../../../../app/(member)/history";
import { useMemberHistoryQuery } from "@/hooks/use-mobile-queries";
import { createMemberHistoryResponse } from "@/test/factories";
import { renderWithProviders } from "@/test/render";

jest.mock("@/hooks/use-mobile-queries", () => ({
  useMemberHistoryQuery: jest.fn(),
}));

describe("MemberHistoryScreen", () => {
  it("shows empty archive state when history is empty", () => {
    (useMemberHistoryQuery as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<MemberHistoryScreen />);
    expect(screen.getByText("Sin sesiones archivadas")).toBeOnTheScreen();
    expect(screen.getByText("Ir a mi rutina")).toBeOnTheScreen();
  });

  it("renders archived history items", () => {
    (useMemberHistoryQuery as jest.Mock).mockReturnValue({
      data: createMemberHistoryResponse(),
      isLoading: false,
    });

    renderWithProviders(<MemberHistoryScreen />);

    expect(screen.getByText("Rutina anterior")).toBeOnTheScreen();
    expect(screen.getByText("ARCHIVADA")).toBeOnTheScreen();
  });
});
