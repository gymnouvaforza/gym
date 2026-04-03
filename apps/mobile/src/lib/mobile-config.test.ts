describe("getMobileConfigState", () => {
  it("returns parsed config when expo extra is valid", async () => {
    jest.resetModules();
    const Constants = require("expo-constants").default;
    Constants.expoConfig.extra = {
      apiBaseUrl: "http://localhost:3000",
      supabaseAnonKey: "anon-key",
      supabaseUrl: "https://example.supabase.co",
    };

    const { getMobileConfig, getMobileConfigState } = require("./mobile-config");

    expect(getMobileConfig()).toEqual({
      apiBaseUrl: "http://localhost:3000",
      supabaseAnonKey: "anon-key",
      supabaseUrl: "https://example.supabase.co",
    });
    expect(getMobileConfigState()).toEqual({
      config: {
        apiBaseUrl: "http://localhost:3000",
        supabaseAnonKey: "anon-key",
        supabaseUrl: "https://example.supabase.co",
      },
      ok: true,
    });
  });

  it("returns a friendly message when config is incomplete", async () => {
    jest.resetModules();
    const Constants = require("expo-constants").default;
    Constants.expoConfig.extra = {
      apiBaseUrl: "http://localhost:3000",
      supabaseAnonKey: "",
      supabaseUrl: "",
    };

    const { getMobileConfigState } = require("./mobile-config");

    expect(getMobileConfigState()).toEqual({
      message:
        "Faltan variables para Supabase en Expo. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY antes de abrir la app.",
      ok: false,
    });
  });
});

describe("normalizeApiBaseUrl", () => {
  it("maps Android emulator host to localhost on iOS", async () => {
    jest.resetModules();
    const { normalizeApiBaseUrl } = require("./mobile-config");

    expect(normalizeApiBaseUrl("http://10.0.2.2:3000", "ios", null)).toBe("http://localhost:3000");
  });

  it("maps localhost to Android emulator host on Android", async () => {
    jest.resetModules();
    const { normalizeApiBaseUrl } = require("./mobile-config");

    expect(normalizeApiBaseUrl("http://localhost:3000", "android", null)).toBe("http://10.0.2.2:3000");
    expect(normalizeApiBaseUrl("http://127.0.0.1:3000", "android", null)).toBe("http://10.0.2.2:3000");
  });

  it("prefers the Expo Go LAN host for local API URLs", async () => {
    jest.resetModules();
    const { normalizeApiBaseUrl } = require("./mobile-config");

    expect(normalizeApiBaseUrl("http://localhost:3000", "ios", "192.168.1.55")).toBe(
      "http://192.168.1.55:3000",
    );
    expect(normalizeApiBaseUrl("http://10.0.2.2:3000", "android", "192.168.1.55")).toBe(
      "http://192.168.1.55:3000",
    );
  });
});
