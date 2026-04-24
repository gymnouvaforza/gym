// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DeleteEntityButton from "@/components/admin/DeleteEntityButton";

const deleteButtonMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: deleteButtonMocks.push,
    refresh: deleteButtonMocks.refresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => deleteButtonMocks.toastError(...args),
    success: (...args: unknown[]) => deleteButtonMocks.toastSuccess(...args),
  },
}));

vi.mock("@/features/admin/components/shared/delete-confirm-dialog", () => ({
  DeleteConfirmDialog: ({
    description,
    isOpen,
    onConfirm,
    title,
  }: {
    description: string;
    isOpen: boolean;
    onConfirm: () => void;
    title: string;
  }) =>
    isOpen ? (
      <div>
        <p>{title}</p>
        <p>{description}</p>
        <button type="button" onClick={onConfirm}>
          Confirmar borrado
        </button>
      </div>
    ) : null,
}));

describe("DeleteEntityButton", () => {
  beforeEach(() => {
    deleteButtonMocks.push.mockReset();
    deleteButtonMocks.refresh.mockReset();
    deleteButtonMocks.toastError.mockReset();
    deleteButtonMocks.toastSuccess.mockReset();
  });

  it("confirms deletion and redirects after success", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <DeleteEntityButton
        entityId="req_01"
        onDelete={onDelete}
        title="Eliminar solicitud"
        description="Se perdera el historial."
        redirectTo="/dashboard/membresias/pedidos"
        successMessage="Solicitud eliminada."
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar solicitud/i }));
    expect(screen.getByText("Se perdera el historial.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirmar borrado/i }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith("req_01");
    });
    await waitFor(() => {
      expect(deleteButtonMocks.toastSuccess).toHaveBeenCalledWith("Solicitud eliminada.");
      expect(deleteButtonMocks.push).toHaveBeenCalledWith("/dashboard/membresias/pedidos");
      expect(deleteButtonMocks.refresh).toHaveBeenCalled();
    });
  });

  it("surfaces deletion errors through toast", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockRejectedValue(new Error("No se pudo borrar"));

    render(
      <DeleteEntityButton
        entityId="req_02"
        onDelete={onDelete}
        title="Eliminar solicitud"
        description="Se perdera el historial."
        redirectTo="/dashboard/membresias/pedidos"
        successMessage="Solicitud eliminada."
      />,
    );

    await user.click(screen.getByRole("button", { name: /eliminar solicitud/i }));
    await user.click(screen.getByRole("button", { name: /confirmar borrado/i }));

    await waitFor(() => {
      expect(deleteButtonMocks.toastError).toHaveBeenCalledWith("No se pudo borrar");
    });
    expect(deleteButtonMocks.push).not.toHaveBeenCalled();
  });
});
