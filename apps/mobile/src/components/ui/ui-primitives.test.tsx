import { Text } from "react-native";

import { fireEvent, screen } from "@testing-library/react-native";
import { CircleAlert } from "lucide-react-native";

import { NFBottomTabBar } from "@/components/ui/nf-bottom-tab-bar";
import { NFButton } from "@/components/ui/nf-button";
import { NFEmptyState } from "@/components/ui/nf-empty-state";
import { NFInput } from "@/components/ui/nf-input";
import { NFStatusBadge } from "@/components/ui/nf-status-badge";
import { NFToast } from "@/components/ui/nf-toast";
import { renderWithProviders } from "@/test/render";

describe("mobile UI primitives", () => {
  it("fires NFButton presses and hides content while loading", () => {
    const onPress = jest.fn();
    const { rerender } = renderWithProviders(<NFButton onPress={onPress}>Guardar</NFButton>);

    fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<NFButton loading>Guardar</NFButton>);
    expect(screen.queryByText("Guardar")).not.toBeOnTheScreen();
  });

  it("toggles NFInput password visibility", () => {
    renderWithProviders(
      <NFInput
        label="Password"
        onChangeText={jest.fn()}
        secureTextEntry
        value="demo1234"
      />,
    );

    const input = screen.getByDisplayValue("demo1234");
    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(screen.getByRole("button"));
    expect(screen.getByDisplayValue("demo1234").props.secureTextEntry).toBe(false);
  });

  it("renders empty states, badges and toasts", () => {
    const onActionPress = jest.fn();
    renderWithProviders(
      <>
        <NFEmptyState
          actionLabel="Reintentar"
          description="No hay datos aun."
          icon={CircleAlert}
          onActionPress={onActionPress}
          title="Sin datos"
        />
        <NFStatusBadge status="paused" />
        <NFToast message="Guardado correctamente" />
      </>,
    );

    expect(screen.getByText("Sin datos")).toBeOnTheScreen();
    expect(screen.getByText("paused")).toBeOnTheScreen();
    expect(screen.getByText("Guardado correctamente")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Reintentar"));
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it("navigates from the custom bottom tab bar", () => {
    const { router } = require("expo-router");
    const navigation = { navigate: jest.fn() };

    renderWithProviders(
      <NFBottomTabBar
        navigation={navigation as never}
        state={
          {
            index: 0,
            key: "tab-key",
            routeNames: ["index", "account"],
            routes: [
              { key: "index-key", name: "index" },
              { key: "account-key", name: "account" },
            ],
            stale: false,
            type: "tab",
            history: [],
          } as never
        }
        descriptors={{}}
        insets={{ bottom: 0, left: 0, right: 0, top: 0 }}
      />,
    );

    fireEvent.press(screen.getByText("Cuenta"));
    expect(navigation.navigate).toHaveBeenCalledWith("account");
    expect(router.push).not.toHaveBeenCalled();
  });
});
