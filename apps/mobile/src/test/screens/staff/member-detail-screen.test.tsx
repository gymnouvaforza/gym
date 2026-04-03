import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import StaffMemberDetailScreen from "../../../../app/(staff)/members/[id]";
import {
  useStaffMemberDetailQuery,
  useUpdateStaffMemberMutation,
} from "@/hooks/use-mobile-queries";
import { createStaffMemberDetail } from "@/test/factories";
import { createTestQueryClient, renderWithProviders } from "@/test/render";

jest.mock("@/hooks/use-mobile-queries", () => ({
  useStaffMemberDetailQuery: jest.fn(),
  useUpdateStaffMemberMutation: jest.fn(),
}));

describe("StaffMemberDetailScreen", () => {
  it("shows assign routine empty state when the member has no active routine", () => {
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValue({ id: "member-1" });
    (useUpdateStaffMemberMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    });
    (useStaffMemberDetailQuery as jest.Mock).mockReturnValue({
      data: createStaffMemberDetail({ activeRoutine: null }),
      isLoading: false,
    });

    renderWithProviders(<StaffMemberDetailScreen />);
    expect(screen.getByText("Sin rutina activa")).toBeOnTheScreen();
  });

  it("updates member status and invalidates dependent queries", async () => {
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValue({ id: "member-1" });
    const mutateAsync = jest.fn(async () => undefined);
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    (useUpdateStaffMemberMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync,
    });
    (useStaffMemberDetailQuery as jest.Mock).mockReturnValue({
      data: createStaffMemberDetail(),
      isLoading: false,
    });

    renderWithProviders(<StaffMemberDetailScreen />, { queryClient });
    fireEvent.press(screen.getByText("Pausar"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ status: "paused" });
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  it("renders member training feedback for staff", () => {
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValue({ id: "member-1" });
    (useUpdateStaffMemberMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    });
    (useStaffMemberDetailQuery as jest.Mock).mockReturnValue({
      data: createStaffMemberDetail(),
      isLoading: false,
    });

    renderWithProviders(<StaffMemberDetailScreen />);

    expect(screen.getByText("Comentarios")).toBeOnTheScreen();
    expect(screen.getByText("Buen bloque para retomar ritmo.")).toBeOnTheScreen();
    expect(screen.getByText("Back squat")).toBeOnTheScreen();
  });
});
