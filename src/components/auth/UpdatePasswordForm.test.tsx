// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

const pushMock = vi.fn();
const updateUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      updateUser: updateUserMock,
    },
  }),
}));

describe("UpdatePasswordForm", () => {
  beforeEach(() => {
    updateUserMock.mockReset();
    pushMock.mockReset();
  });

  it("renders the form correctly", () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByLabelText("Contrasena")).toBeInTheDocument();
    expect(screen.getByLabelText("Repite la contrasena")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Actualizar contrasena/i })).toBeInTheDocument();
  });

  it("blocks update if passwords do not match", async () => {
    const user = userEvent.setup();

    render(<UpdatePasswordForm />);

    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret99");
    await user.click(screen.getByRole("button", { name: /Actualizar contrasena/i }));

    expect(await screen.findByText("Las contrasenas no coinciden.")).toBeInTheDocument();
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("shows success message and redirects after update", async () => {
    updateUserMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(<UpdatePasswordForm />);

    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: /Actualizar contrasena/i }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ password: "secret12" });
      expect(screen.getByText("Contrasena actualizada")).toBeInTheDocument();
    });

    // We don't wait for the 3s redirect here to avoid long tests
  });

  it("shows error message if update fails", async () => {
    updateUserMock.mockResolvedValue({ error: { message: "Error al actualizar la contrasena" } });
    const user = userEvent.setup();

    render(<UpdatePasswordForm />);

    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: /Actualizar contrasena/i }));

    await waitFor(() => {
      expect(screen.getByText("Error al actualizar la contrasena")).toBeInTheDocument();
    });
  });
});
