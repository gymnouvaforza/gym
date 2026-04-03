import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import AssignRoutineModal from "../../../../app/modal/assign-routine";
import { useAssignRoutineMutation, useRoutineTemplatesQuery } from "@/hooks/use-mobile-queries";
import { createRoutineTemplates } from "@/test/factories";
import { createTestQueryClient, renderWithProviders } from "@/test/render";

jest.mock("@/hooks/use-mobile-queries", () => ({
  useAssignRoutineMutation: jest.fn(),
  useRoutineTemplatesQuery: jest.fn(),
}));

describe("AssignRoutineModal", () => {
  it("submits the selected template and shows the confirmation toast", async () => {
    const { useLocalSearchParams } = require("expo-router");
    useLocalSearchParams.mockReturnValue({
      memberId: "member-1",
      memberName: "Nova Tester",
    });

    const mutateAsync = jest.fn(async () => ({
      assignmentId: "assignment-1",
      memberId: "member-1",
      message: "Rutina activa para Nova Tester.",
      status: "active",
      templateId: "template-1",
    }));

    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    (useRoutineTemplatesQuery as jest.Mock).mockReturnValue({
      data: createRoutineTemplates(),
      isLoading: false,
    });
    (useAssignRoutineMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutateAsync,
    });

    renderWithProviders(<AssignRoutineModal />, { queryClient });

    fireEvent.press(screen.getByText("Fuerza base"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Carga, observaciones o foco de revisión"),
      "Subir carga",
    );
    fireEvent.press(screen.getByText("Confirmar asignación"));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        memberId: "member-1",
        notes: "Subir carga",
        recommendedScheduleLabel: "",
        templateId: "template-1",
      });
      expect(screen.getByText("Rutina activa para Nova Tester.")).toBeOnTheScreen();
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
