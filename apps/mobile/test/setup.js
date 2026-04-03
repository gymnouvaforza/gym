require("react-native-gesture-handler/jestSetup");

const { cleanup } = require("@testing-library/react-native");

const mockExpoExtra = {
  apiBaseUrl: "http://localhost:3000",
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "anon-key",
};

jest.mock("expo-router", () => {
  const React = require("react");

  const router = {
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
    navigate: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    setParams: jest.fn(),
  };

  const useLocalSearchParams = jest.fn(() => ({}));

  function Link({ children }) {
    return React.isValidElement(children) ? children : null;
  }

  function Stack({ children }) {
    return React.createElement(React.Fragment, null, children);
  }

  Stack.Screen = () => null;

  return {
    Link,
    Redirect: () => null,
    Stack,
    router,
    useLocalSearchParams,
    usePathname: jest.fn(() => "/"),
    useRouter: () => router,
    useSegments: jest.fn(() => []),
  };
});

jest.mock("expo-image", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Image: function MockExpoImage(props) {
      return React.createElement(View, {
        ...props,
        accessibilityRole: "image",
      });
    },
  };
});

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: { ...mockExpoExtra },
    },
  },
}));

jest.mock("expo-splash-screen", () => ({
  hideAsync: jest.fn(async () => undefined),
  preventAutoHideAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("@expo-google-fonts/epilogue", () => ({
  Epilogue_700Bold: "Epilogue_700Bold",
  Epilogue_900Black: "Epilogue_900Black",
  useFonts: () => [true],
}));

jest.mock("@expo-google-fonts/inter", () => ({
  Inter_400Regular: "Inter_400Regular",
  Inter_700Bold: "Inter_700Bold",
  Inter_800ExtraBold: "Inter_800ExtraBold",
  useFonts: () => [true],
}));

jest.mock("@shopify/flash-list", () => {
  const React = require("react");
  const { FlatList } = require("react-native");

  return {
    FlashList: React.forwardRef((props, ref) => React.createElement(FlatList, { ...props, ref })),
  };
});

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => undefined;
  return Reanimated;
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
