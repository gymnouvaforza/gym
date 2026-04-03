import { screen } from "@testing-library/react-native";

import MemberRoutineScreen from "../../../../app/(member)/routine";
import {
  useMemberRoutineQuery,
  useUpdateExerciseFeedbackMutation,
  useUpdateRoutineFeedbackMutation,
} from "@/hooks/use-mobile-queries";
import { createMemberRoutineResponse } from "@/test/factories";
import { renderWithProviders } from "@/test/render";

jest.mock("@/hooks/use-mobile-queries", () => ({
  useMemberRoutineQuery: jest.fn(),
  useUpdateExerciseFeedbackMutation: jest.fn(),
  useUpdateRoutineFeedbackMutation: jest.fn(),
}));

describe("MemberRoutineScreen", () => {
  beforeEach(() => {
    (useUpdateRoutineFeedbackMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    });
    (useUpdateExerciseFeedbackMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    });
  });

  it("shows empty state when no routine is assigned", () => {
    (useMemberRoutineQuery as jest.Mock).mockReturnValue({
      data: { routine: null },
      isLoading: false,
    });

    renderWithProviders(<MemberRoutineScreen />);
    expect(screen.getByText("SIN RUTINA ACTIVA")).toBeOnTheScreen();
  });

  it("renders the training hub with coach, schedule and exercises", () => {
    (useMemberRoutineQuery as jest.Mock).mockReturnValue({
      data: createMemberRoutineResponse(),
      isLoading: false,
    });

    renderWithProviders(<MemberRoutineScreen />);

    expect(screen.getByText("Fuerza base")).toBeOnTheScreen();
    expect(screen.getByText("Coach Nova")).toBeOnTheScreen();
    expect(screen.getByText("Lun/Mie/Vie · 19:00")).toBeOnTheScreen();
    expect(screen.getByText("Dia 1")).toBeOnTheScreen();
    expect(screen.getByText("Back squat")).toBeOnTheScreen();
  });
});
