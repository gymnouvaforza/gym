// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

const { confirmPasswordResetMock, pushMock } = vi.hoisted(() => ({
  confirmPasswordResetMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () =>
    new URLSearchParams("mode=resetPassword&oobCode=reset_123&next=%2Facceso%3Fconfirmed%3D1"),
}));

vi.mock("firebase/auth", () => ({
  confirmPasswordReset: confirmPasswordResetMock,
}));

vi.mock("@/lib/firebase/client", () => ({
  getFirebaseBrowserAuth: vi.fn().mockResolvedValue({}),
}));

describe("UpdatePasswordForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    confirmPasswordResetMock.mockReset();
  });

  it("confirms the Firebase reset code and completes the password update", async () => {
    confirmPasswordResetMock.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<UpdatePasswordForm />);

    await user.type(screen.getByLabelText("Contrasena"), "secret12");
    await user.type(screen.getByLabelText("Repite la contrasena"), "secret12");
    await user.click(screen.getByRole("button", { name: "Actualizar contrasena" }));

    await waitFor(() => {
      expect(confirmPasswordResetMock).toHaveBeenCalledWith({}, "reset_123", "secret12");
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 1600);
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/acceso?confirmed=1");
    });
  }, 8000);
});
