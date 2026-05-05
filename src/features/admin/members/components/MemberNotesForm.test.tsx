// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { MemberNotesForm } from "@/features/admin/members/components/MemberNotesForm";

const addMemberNoteActionMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock("@/app/(admin)/dashboard/miembros/actions", () => ({
  addMemberNoteAction: (...args: unknown[]) => addMemberNoteActionMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

describe("MemberNotesForm", () => {
  beforeEach(() => {
    addMemberNoteActionMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it("submits a note, clears the textarea and notifies success", async () => {
    addMemberNoteActionMock.mockResolvedValue({ id: "note-1" });
    const onNoteAdded = vi.fn();
    const user = userEvent.setup();

    render(<MemberNotesForm memberId="member-1" onNoteAdded={onNoteAdded} />);

    const textarea = screen.getByLabelText("Nueva observación");
    await user.type(textarea, "Seguimiento de renovación pendiente.");
    await user.click(screen.getByRole("button", { name: /Guardar observación/i }));

    await waitFor(() => {
      expect(addMemberNoteActionMock).toHaveBeenCalledWith(
        "member-1",
        "Seguimiento de renovación pendiente.",
      );
    });

    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("Observación guardada correctamente.");
    expect(onNoteAdded).toHaveBeenCalledTimes(1);
  });

  it("validates empty notes before calling the server action", async () => {
    const user = userEvent.setup();

    render(<MemberNotesForm memberId="member-1" />);

    await user.click(screen.getByRole("button", { name: /Guardar observación/i }));

    expect(addMemberNoteActionMock).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith("Escribe una observación antes de guardar.");
  });
});
