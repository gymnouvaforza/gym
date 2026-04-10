import { describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getPublicMembershipStatusByToken: vi.fn(),
  parseMembershipQrScannedValue: vi.fn(),
}));

vi.mock("@/lib/data/memberships", () => ({
  getPublicMembershipStatusByToken: routeMocks.getPublicMembershipStatusByToken,
}));

vi.mock("@/lib/membership-qr", () => ({
  parseMembershipQrScannedValue: routeMocks.parseMembershipQrScannedValue,
}));

describe("GET /api/membership/status/[token]", () => {
  it("returns 400 when the token format is invalid", async () => {
    routeMocks.parseMembershipQrScannedValue.mockReturnValue(null);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/membership/status/bad-token"), {
      params: Promise.resolve({ token: "bad-token" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/formato valido/i),
    });
  });

  it("returns the public membership status for a valid token", async () => {
    routeMocks.parseMembershipQrScannedValue.mockReturnValue(
      "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
    );
    routeMocks.getPublicMembershipStatusByToken.mockResolvedValue({
      isCurrentlyValid: true,
      member: {
        fullName: "Socio Titan",
        memberNumber: "NF-2026-0001",
      },
      planTitle: "Membresia Base",
      qrUrl: "https://novaforza.pe/validacion/membresia/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      requestNumber: "MEM-20260409-AAAAAA",
      validation: {
        cycleEndsOn: "2099-05-01",
        cycleStartsOn: "2026-04-01",
        label: "Membresia al dia",
        status: "al_dia",
        tone: "success",
      },
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request(
        "http://localhost/api/membership/status/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      ),
      {
        params: Promise.resolve({ token: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2" }),
      },
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(routeMocks.getPublicMembershipStatusByToken).toHaveBeenCalledWith(
      "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
    );
    expect(payload.status.isCurrentlyValid).toBe(true);
  });
});
