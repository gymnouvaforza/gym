import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import RegisterScreen from "../../../../app/(auth)/register";
import { renderWithProviders } from "@/test/render";

describe("RegisterScreen", () => {
  it("shows verification message when sign up needs email confirmation", async () => {
    const signUp = jest.fn(async () => ({
      error: null,
      needsEmailVerification: true,
    }));

    renderWithProviders(<RegisterScreen />, {
      auth: { signUp },
    });

    fireEvent.changeText(screen.getByPlaceholderText("correo@novaforza.com"), "new@novaforza.com");
    fireEvent.changeText(screen.getByPlaceholderText("Minimo 8 caracteres"), "demo1234");
    fireEvent.press(screen.getByText("Crear acceso"));

    expect(
      await screen.findByText("Revisa tu correo para confirmar la cuenta antes de entrar."),
    ).toBeOnTheScreen();
  });

  it("redirects when sign up returns a session", async () => {
    const { router } = require("expo-router");
    const signUp = jest.fn(async () => ({
      error: null,
      needsEmailVerification: false,
    }));

    renderWithProviders(<RegisterScreen />, {
      auth: { signUp },
    });

    fireEvent.changeText(screen.getByPlaceholderText("correo@novaforza.com"), "new@novaforza.com");
    fireEvent.changeText(screen.getByPlaceholderText("Minimo 8 caracteres"), "demo1234");
    fireEvent.press(screen.getByText("Crear acceso"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/"));
  });
});
