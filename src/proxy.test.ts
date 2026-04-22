import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const proxyMocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getServerSupabaseEnv: vi.fn(),
  hasSupabaseServiceRole: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: proxyMocks.createClient,
}));

vi.mock("@/lib/env", () => ({
  getServerSupabaseEnv: proxyMocks.getServerSupabaseEnv,
  hasSupabaseServiceRole: proxyMocks.hasSupabaseServiceRole,
}));

async function importProxyModule() {
  vi.resetModules();
  return import("./proxy");
}

function createFirebaseSessionCookie(userId: string) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ uid: userId, user_id: userId })).toString(
    "base64url",
  );

  return `${header}.${payload}.signature`;
}

function createSupabaseProxyClient(input: {
  isModuleEnabled: boolean;
  isSuperadmin: boolean;
}) {
  return {
    from: (table: string) => ({
      select: () => ({
        eq: (_column: string, value: string) => {
          if (table === "system_modules") {
            return {
              maybeSingle: async () => ({
                data: { is_enabled: input.isModuleEnabled, name: value },
                error: null,
              }),
            };
          }

          return {
            eq: () => ({
              maybeSingle: async () => ({
                data: input.isSuperadmin ? { role: "superadmin" } : null,
                error: null,
              }),
            }),
          };
        },
      }),
    }),
  };
}

describe("proxy module gating", () => {
  beforeEach(() => {
    proxyMocks.createClient.mockReset();
    proxyMocks.getServerSupabaseEnv.mockReset();
    proxyMocks.hasSupabaseServiceRole.mockReset();
    proxyMocks.getServerSupabaseEnv.mockReturnValue({
      url: "https://supabase.test",
      serviceRoleKey: "service-role",
    });
    proxyMocks.hasSupabaseServiceRole.mockReturnValue(true);
  });

  it("rewrites disabled module routes to gated 404 for non-superadmin", async () => {
    proxyMocks.createClient.mockReturnValue(
      createSupabaseProxyClient({ isModuleEnabled: false, isSuperadmin: false }),
    );

    const { proxy } = await importProxyModule();
    const response = await proxy(new NextRequest("http://localhost/tienda"));

    expect(response.headers.get("x-middleware-rewrite")).toContain("/_gated-404");
  });

  it("allows disabled module routes for superadmin requests", async () => {
    proxyMocks.createClient.mockReturnValue(
      createSupabaseProxyClient({ isModuleEnabled: false, isSuperadmin: true }),
    );

    const { proxy } = await importProxyModule();
    const request = new NextRequest("http://localhost/tienda", {
      headers: {
        cookie: `gym_firebase_session=${createFirebaseSessionCookie("root-1")}`,
      },
    });
    const response = await proxy(request);

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("rewrites disabled mobile dashboard routes for non-superadmin", async () => {
    proxyMocks.createClient.mockReturnValue(
      createSupabaseProxyClient({ isModuleEnabled: false, isSuperadmin: false }),
    );

    const { proxy } = await importProxyModule();
    const response = await proxy(
      new NextRequest("http://localhost/dashboard/mobile", {
        headers: {
          cookie: `gym_firebase_session=${createFirebaseSessionCookie("staff-1")}`,
        },
      }),
    );

    expect(response.headers.get("x-middleware-rewrite")).toContain("/_gated-404");
  });

  it("does nothing on unrelated routes", async () => {
    proxyMocks.createClient.mockReturnValue(
      createSupabaseProxyClient({ isModuleEnabled: false, isSuperadmin: false }),
    );

    const { proxy } = await importProxyModule();
    const response = await proxy(new NextRequest("http://localhost/horarios"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
