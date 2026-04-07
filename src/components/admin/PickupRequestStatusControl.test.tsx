// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import PickupRequestStatusControl from "@/components/admin/PickupRequestStatusControl";

const updateDashboardPickupRequestStatusMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("@/app/(admin)/dashboard/tienda/actions", () => ({
  updateDashboardPickupRequestStatus: (...args: unknown[]) =>
    updateDashboardPickupRequestStatusMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe("PickupRequestStatusControl", () => {
  beforeEach(() => {
    updateDashboardPickupRequestStatusMock.mockReset();
    refreshMock.mockReset();
  });

  it("shows quick actions for the next operational steps", () => {
    render(
      <PickupRequestStatusControl pickupRequestId="pick_01" status="ready_for_pickup" />,
    );

    expect(screen.getByText("Marcar entregado")).toBeInTheDocument();
    expect(screen.getByText("Volver a confirmado")).toBeInTheDocument();
  });

  it("updates the status immediately when a quick action is used", async () => {
    updateDashboardPickupRequestStatusMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<PickupRequestStatusControl pickupRequestId="pick_01" status="confirmed" />);

    await user.click(screen.getByText("Marcar listo para recoger"));

    await waitFor(() => {
      expect(updateDashboardPickupRequestStatusMock).toHaveBeenCalledWith(
        "pick_01",
        "ready_for_pickup",
      );
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it("updates the status when using the advanced selector", async () => {
    updateDashboardPickupRequestStatusMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<PickupRequestStatusControl pickupRequestId="pick_01" status="requested" />);

    await user.selectOptions(screen.getByLabelText("Selector avanzado"), "confirmed");

    await waitFor(() => {
      expect(updateDashboardPickupRequestStatusMock).toHaveBeenCalledWith(
        "pick_01",
        "confirmed",
      );
    });
  });
});
