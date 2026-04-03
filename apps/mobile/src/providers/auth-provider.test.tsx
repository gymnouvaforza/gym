import { Text } from "react-native";

import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { MobileApiError } from "@/lib/api";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { createMobileSession } from "@/test/factories";

const mockMobileFetchJson = jest.fn();
const mockGetSupabaseClient = jest.fn();

jest.mock("@/lib/api", () => ({
  MobileApiError: class extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
  mobileFetchJson: (...args: unknown[]) => mockMobileFetchJson(...args),
}));

jest.mock("@/lib/supabase", () => ({
  getSupabaseClient: () => mockGetSupabaseClient(),
}));

function AuthConsumer() {
  const auth = useAuth();

  return (
    <>
      <Text>{auth.mobileSession?.displayName ?? "sin-perfil"}</Text>
      <Text>{auth.role ?? "sin-rol"}</Text>
      <Text>{auth.isHydrated ? "hidratado" : "pendiente"}</Text>
      <Text>{auth.isProfileLoading ? "cargando" : "listo"}</Text>
      <Text onPress={() => auth.signIn("coach@novaforza.com", "demo1234")}>sign-in</Text>
      <Text onPress={() => auth.signUp("new@novaforza.com", "demo1234")}>sign-up</Text>
      <Text onPress={() => auth.signOut()}>sign-out</Text>
    </>
  );
}

describe("AuthProvider", () => {
  const signInWithPassword = jest.fn();
  const signOut = jest.fn();
  const signUp = jest.fn();
  const getSession = jest.fn();
  const unsubscribe = jest.fn();

  beforeEach(() => {
    signInWithPassword.mockResolvedValue({ error: null });
    signOut.mockResolvedValue({});
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "token-1",
          refresh_token: "refresh-token",
          user: {
            email: "coach@novaforza.com",
            id: "user-1",
          },
        },
      },
    });
    mockMobileFetchJson.mockResolvedValue(createMobileSession({ role: "staff" }));
    mockGetSupabaseClient.mockReturnValue({
      auth: {
        getSession,
        onAuthStateChange: jest.fn(() => ({
          data: {
            subscription: {
              unsubscribe,
            },
          },
        })),
        signInWithPassword,
        signOut,
        signUp,
      },
    });
  });

  it("hydrates session and loads the mobile profile", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("hidratado")).toBeOnTheScreen();
      expect(screen.getByText("Nova Tester")).toBeOnTheScreen();
      expect(screen.getByText("staff")).toBeOnTheScreen();
    });

    expect(mockMobileFetchJson).toHaveBeenCalledWith("/api/mobile/me", {
      accessToken: "token-1",
    });
  });

  it("delegates sign-in, sign-up and sign-out to Supabase auth", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("hidratado")).toBeOnTheScreen());

    fireEvent.press(screen.getByText("sign-in"));
    fireEvent.press(screen.getByText("sign-up"));
    fireEvent.press(screen.getByText("sign-out"));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "coach@novaforza.com",
        password: "demo1234",
      });
      expect(signUp).toHaveBeenCalledWith({
        email: "new@novaforza.com",
        password: "demo1234",
      });
      expect(signOut).toHaveBeenCalled();
    });
  });

  it("signs out when the profile refresh receives a 401", async () => {
    mockMobileFetchJson.mockRejectedValue(new MobileApiError("No autorizado", 401));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(screen.getByText("sin-perfil")).toBeOnTheScreen();
    });
  });
});
