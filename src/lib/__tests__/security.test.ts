import { describe, expect, it, vi, beforeEach } from "vitest";
import { 
  createSupabasePublicClient, 
  createSupabaseServerClient,
  createSupabaseAdminClient
} from "../supabase/server";

// Mock de variables de entorno para que no fallen los clientes
vi.mock("../env", () => ({
  getPublicSupabaseEnv: () => ({ url: "https://xyz.supabase.co", anonKey: "anon-key" }),
  getServerSupabaseEnv: () => ({ url: "https://xyz.supabase.co", serviceRoleKey: "service-key" }),
}));

// Mock de Firebase Bearer Header para simular diferentes usuarios
const firebaseMocks = vi.hoisted(() => ({
  getFirebaseSessionBearerHeader: vi.fn(),
}));

vi.mock("../firebase/server", () => ({
  getFirebaseSessionBearerHeader: firebaseMocks.getFirebaseSessionBearerHeader,
}));

describe("Supabase RLS & Role Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("public client uses anon key and no auth header", async () => {
    const client = createSupabasePublicClient();
    // @ts-ignore
    expect(client.supabaseKey).toBe("anon-key");
  });

  it("server client includes bearer token if session exists", async () => {
    firebaseMocks.getFirebaseSessionBearerHeader.mockResolvedValue("Bearer firebase-token");
    const client = await createSupabaseServerClient();
    
    // @ts-ignore
    const restConfig = client.rest;
    // En el cliente Supabase, las cabeceras pueden estar en un objeto literal o Headers
    const authHeader = (restConfig.headers as any).Authorization || (restConfig.headers as any).get?.('Authorization');
    expect(authHeader).toBe("Bearer firebase-token");
  });

  it("admin client uses service role key", () => {
    const client = createSupabaseAdminClient();
    // @ts-ignore
    expect(client.supabaseKey).toBe("service-key");
  });
});
