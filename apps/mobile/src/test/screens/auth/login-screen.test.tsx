import { fireEvent, screen, waitFor } from "@testing-library/react-native";

import LoginScreen from "../../../../app/(auth)/login";
import { renderWithProviders } from "@/test/render";

describe("LoginScreen", () => {
  it("navigates to root after successful sign in", async () => {
    const { router } = require("expo-router");
    const signIn = jest.fn(async () => ({ error: null }));

    renderWithProviders(<LoginScreen />, {
      auth: { signIn },
    });

    const emailInput = screen.getByPlaceholderText("correo@novaforza.com");
    const passwordInput = screen.getByPlaceholderText("********");
    fireEvent.changeText(emailInput, "test@novaforza.com");
    fireEvent.changeText(passwordInput, "test1234");
    fireEvent.press(screen.getByText("Iniciar sesión"));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("test@novaforza.com", "test1234");
      expect(router.replace).toHaveBeenCalledWith("/");
    });
  });

  it("shows a backend error when sign in fails", async () => {
    const signIn = jest.fn(async () => ({ error: "Credenciales invalidas" }));

    renderWithProviders(<LoginScreen />, {
      auth: { signIn },
    });

    fireEvent.press(screen.getByText("Iniciar sesión"));

    expect(await screen.findByText("Credenciales invalidas")).toBeOnTheScreen();
  });
});
