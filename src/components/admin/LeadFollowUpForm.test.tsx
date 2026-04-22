// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import LeadFollowUpForm from "@/components/admin/LeadFollowUpForm";
import { defaultLeads } from "@/lib/data/default-content";

const saveLeadFollowUpMock = vi.fn();

vi.mock("@/app/(admin)/dashboard/actions", () => ({
  saveLeadFollowUp: (...args: unknown[]) => saveLeadFollowUpMock(...args),
}));

describe("LeadFollowUpForm", () => {
  beforeEach(() => {
    saveLeadFollowUpMock.mockReset();
  });

  it("loads the persisted follow-up values", () => {
    render(<LeadFollowUpForm lead={defaultLeads[1]} />);

    expect(screen.getByDisplayValue(defaultLeads[1].channel ?? "")).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultLeads[1].outcome ?? "")).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultLeads[1].next_step ?? "")).toBeInTheDocument();
  });

  it("sends the follow-up payload on save", async () => {
    saveLeadFollowUpMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { container } = render(<LeadFollowUpForm lead={defaultLeads[0]} />);

    const channelInput = container.querySelector('input[name="channel"]');
    const outcomeInput = container.querySelector('input[name="outcome"]');
    const nextStepTextarea = container.querySelector('textarea[name="next_step"]');

    expect(channelInput).toBeInstanceOf(HTMLInputElement);
    expect(outcomeInput).toBeInstanceOf(HTMLInputElement);
    expect(nextStepTextarea).toBeInstanceOf(HTMLTextAreaElement);

    await user.clear(channelInput as HTMLInputElement);
    await user.type(channelInput as HTMLInputElement, "Email");
    await user.clear(outcomeInput as HTMLInputElement);
    await user.type(outcomeInput as HTMLInputElement, "Pidio brochure");
    await user.clear(nextStepTextarea as HTMLTextAreaElement);
    await user.type(nextStepTextarea as HTMLTextAreaElement, "Enviar resumen esta tarde.");
    await user.click(screen.getByRole("button", { name: /Guardar Seguimiento/i }));

    await waitFor(() => {
      expect(saveLeadFollowUpMock).toHaveBeenCalledWith(defaultLeads[0].id, {
        contacted_at: "",
        channel: "Email",
        outcome: "Pidio brochure",
        next_step: "Enviar resumen esta tarde.",
      });
    });
  });
});
