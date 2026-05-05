// @vitest-environment jsdom

import { render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";

import { MemberNotesPanel } from "@/features/admin/members/components/MemberNotesPanel";
import type { MemberNote } from "@/lib/data/member-notes";

const getMemberNotesActionMock = vi.fn();

vi.mock("@/app/(admin)/dashboard/miembros/actions", () => ({
  getMemberNotesAction: (...args: unknown[]) => getMemberNotesActionMock(...args),
}));

function buildNote(overrides: Partial<MemberNote>): MemberNote {
  return {
    content: "Nota interna",
    createdAt: "2026-05-04T10:00:00.000Z",
    createdByEmail: "coach@novaforza.com",
    createdByUserId: "user-1",
    id: "note-1",
    memberId: "member-1",
    ...overrides,
  };
}

describe("MemberNotesPanel", () => {
  beforeEach(() => {
    getMemberNotesActionMock.mockReset();
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-05-05T10:00:00.000Z").getTime());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders member notes newest first with author and relative date", async () => {
    getMemberNotesActionMock.mockResolvedValue([
      buildNote({
        content: "Primera llamada realizada.",
        createdAt: "2026-05-03T10:00:00.000Z",
        id: "older-note",
      }),
      buildNote({
        content: "Quiere renovar esta semana.",
        createdAt: "2026-05-04T10:00:00.000Z",
        createdByEmail: null,
        id: "newer-note",
      }),
    ]);

    render(<MemberNotesPanel memberId="member-1" />);

    await waitFor(() => {
      expect(screen.getByText("Quiere renovar esta semana.")).toBeInTheDocument();
    });

    expect(getMemberNotesActionMock).toHaveBeenCalledWith("member-1");

    const cards = screen.getAllByRole("article");
    expect(within(cards[0]).getByText("Quiere renovar esta semana.")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Sistema")).toBeInTheDocument();
    expect(within(cards[0]).getByText("ayer")).toBeInTheDocument();
    expect(within(cards[1]).getByText("Primera llamada realizada.")).toBeInTheDocument();
    expect(within(cards[1]).getByText("coach@novaforza.com")).toBeInTheDocument();
  });

  it("renders the empty state when there are no notes", async () => {
    getMemberNotesActionMock.mockResolvedValue([]);

    render(<MemberNotesPanel memberId="member-1" />);

    await waitFor(() => {
      expect(screen.getByText("Sin observaciones")).toBeInTheDocument();
    });
  });
});
