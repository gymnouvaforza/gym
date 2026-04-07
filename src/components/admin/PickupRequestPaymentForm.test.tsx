// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import PickupRequestPaymentForm from "@/components/admin/PickupRequestPaymentForm";

const addPickupRequestPaymentEntryActionMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("@/app/(admin)/dashboard/tienda/actions", () => ({
  addPickupRequestPaymentEntryAction: (...args: unknown[]) =>
    addPickupRequestPaymentEntryActionMock(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe("PickupRequestPaymentForm", () => {
  beforeEach(() => {
    addPickupRequestPaymentEntryActionMock.mockReset();
    refreshMock.mockReset();
  });

  it("keeps the partial payment button disabled until the amount is valid", async () => {
    const user = userEvent.setup();

    render(
      <PickupRequestPaymentForm
        pickupRequestId="pick_01"
        currencyCode="PEN"
        balanceDue={80}
      />,
    );

    const partialButton = screen.getByRole("button", {
      name: /Registrar abono parcial/i,
    });
    expect(partialButton).toBeDisabled();

    await user.type(screen.getByLabelText("Importe del abono"), "20");

    expect(partialButton).toBeEnabled();
  });

  it("submits a partial payment entry with the typed amount and note", async () => {
    addPickupRequestPaymentEntryActionMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <PickupRequestPaymentForm
        pickupRequestId="pick_01"
        currencyCode="PEN"
        balanceDue={80}
      />,
    );

    await user.type(screen.getByLabelText("Importe del abono"), "20.5");
    await user.type(screen.getByLabelText("Nota del cobro"), "Abono en efectivo");
    await user.click(screen.getByRole("button", { name: /Registrar abono parcial/i }));

    await waitFor(() => {
      expect(addPickupRequestPaymentEntryActionMock).toHaveBeenCalledWith("pick_01", "PEN", {
        amount: 20.5,
        note: "Abono en efectivo",
      });
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(
      screen.getByText("Abono parcial registrado en la bitacora de pagos."),
    ).toBeInTheDocument();
  });

  it("submits the full remaining balance when marking the payment as complete", async () => {
    addPickupRequestPaymentEntryActionMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <PickupRequestPaymentForm
        pickupRequestId="pick_02"
        currencyCode="PEN"
        balanceDue={19.95}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Marcar pago completo/i }));

    await waitFor(() => {
      expect(addPickupRequestPaymentEntryActionMock).toHaveBeenCalledWith("pick_02", "PEN", {
        amount: 19.95,
        note: "",
      });
    });
  });

  it("surfaces action errors without clearing the user context", async () => {
    addPickupRequestPaymentEntryActionMock.mockRejectedValue(
      new Error("Este pedido ya figura como cobrado manualmente al completo."),
    );
    const user = userEvent.setup();

    render(
      <PickupRequestPaymentForm
        pickupRequestId="pick_03"
        currencyCode="PEN"
        balanceDue={10}
      />,
    );

    await user.type(screen.getByLabelText("Importe del abono"), "10");
    await user.type(screen.getByLabelText("Nota del cobro"), "Intento duplicado");
    await user.click(screen.getByRole("button", { name: /Registrar abono parcial/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Este pedido ya figura como cobrado manualmente al completo."),
      ).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Intento duplicado")).toBeInTheDocument();
  });

  it("disables the full payment button when there is no outstanding balance", () => {
    render(
      <PickupRequestPaymentForm
        pickupRequestId="pick_04"
        currencyCode="PEN"
        balanceDue={0}
      />,
    );

    expect(screen.getByRole("button", { name: /Marcar pago completo/i })).toBeDisabled();
  });
});
