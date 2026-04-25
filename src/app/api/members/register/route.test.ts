import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

// Mock de Firebase Admin
const mockAuth = {
  createUser: vi.fn(),
  deleteUser: vi.fn(),
};

vi.mock("@/lib/firebase/server", () => ({
  getFirebaseAdminAuth: vi.fn(() => mockAuth),
}));

// Mock de Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseAdminClient: vi.fn(() => mockSupabase),
}));

// Mock de email actions
vi.mock("@/lib/firebase/email-actions", () => ({
  sendFirebaseVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock de SEO
vi.mock("@/lib/seo", () => ({
  SITE_URL: "https://test.com",
}));

describe("POST /api/members/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it("debe registrar un usuario correctamente", async () => {
    mockAuth.createUser.mockResolvedValue({ uid: "new-user-123" });
    mockSupabase.insert.mockResolvedValue({ error: null });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test User",
          email: "test@example.com",
          phone: "987654321",
          password: "password123",
          confirmPassword: "password123",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(mockAuth.createUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("member_profiles");
  });

  it("debe retornar error si el email ya existe", async () => {
    mockAuth.createUser.mockRejectedValue({ code: "auth/email-already-exists" });

    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Test User",
          email: "existing@example.com",
          phone: "987654321",
          password: "password123",
          confirmPassword: "password123",
        }),
      })
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Ya existe");
  });

  it("debe retornar error si la validación de Zod falla", async () => {
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          fullName: "T", // Demasiado corto
          email: "invalid-email",
        }),
      })
    );

    expect(response.status).toBe(400);
  });
});
