// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import LeadDetailsDialogTrigger from "@/components/admin/LeadDetailsDialogTrigger";
import { defaultLeads } from "@/lib/data/default-content";

vi.mock("@/app/(admin)/dashboard/actions", () => ({
  saveLeadFollowUp: vi.fn().mockResolvedValue(undefined),
  updateLeadStatus: vi.fn().mockResolvedValue(undefined),
}));

describe("LeadDetailsDialogTrigger", () => {
  it("opens a dialog with the full lead detail and metadata", async () => {
    const user = userEvent.setup();

    render(<LeadDetailsDialogTrigger lead={defaultLeads[0]} />);

    await user.click(screen.getByRole("button", { name: /Ver expediente/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/reservar una prueba/i)).toBeInTheDocument();
    expect(screen.getAllByText(defaultLeads[0].email).length).toBeGreaterThan(0);
    expect(screen.getByText("Interest")).toBeInTheDocument();
    expect(screen.getByText("prueba")).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultLeads[0].next_step ?? "")).toBeInTheDocument();
  });

  it("shows the phone fallback and keeps the operational controls disabled in read only mode", async () => {
    const user = userEvent.setup();

    render(
      <LeadDetailsDialogTrigger
        lead={{ ...defaultLeads[2], metadata: {} }}
        disabledReason="Solo lectura"
      />,
    );

    await user.click(screen.getByRole("button", { name: /Ver expediente/i }));

    expect(await screen.findByText(/Sin tel/i)).toBeInTheDocument();
    expect(screen.getByText(/Detalles de Captura/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Estado del lead")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Guardar Seguimiento/i })).toBeDisabled();
  });
});
