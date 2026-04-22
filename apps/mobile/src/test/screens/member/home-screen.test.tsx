import { fireEvent, screen } from "@testing-library/react-native";

import MemberHomeScreen from "../../../../app/(member)/index";
import { renderWithProviders } from "@/test/render";

describe("MemberHomeScreen", () => {
  it("renders the empty state when there is no member profile", () => {
    renderWithProviders(<MemberHomeScreen />, {
      auth: {
        mobileSession: {
          displayName: "Nova Tester",
          email: "tester@novaforza.com",
          hasActiveRoutine: false,
          member: null,
          role: "member",
          staffAccessLevel: null,
          userId: "user-1",
        },
      },
    });

    expect(screen.getByText("Perfil no disponible")).toBeOnTheScreen();
  });

  it("shows member summary and quick links when profile exists", () => {
    const { router } = require("expo-router");
    renderWithProviders(<MemberHomeScreen />);

    expect(screen.getByText("Tu ficha")).toBeOnTheScreen();
    expect(screen.getByText("NF-0001")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Abrir rutina"));
    expect(router.push).toHaveBeenCalledWith("/(member)/routine");
  });
});
