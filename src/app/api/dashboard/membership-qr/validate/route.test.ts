import { beforeEach, describe, expect, it, vi } from "vitest";

const routeMocks = vi.hoisted(() => ({
  getCurrentAdminUser: vi.fn(),
  getServerSupabaseEnv: vi.fn(),
  getDashboardMembershipScanResultByToken: vi.fn(),
  parseMembershipQrScanToken: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentAdminUser: routeMocks.getCurrentAdminUser,
}));

vi.mock("@/lib/env", () => ({
  getServerSupabaseEnv: routeMocks.getServerSupabaseEnv,
}));

vi.mock("@/lib/data/memberships", () => ({
  getDashboardMembershipScanResultByToken: routeMocks.getDashboardMembershipScanResultByToken,
  parseMembershipQrScanToken: routeMocks.parseMembershipQrScanToken,
}));

describe("POST /api/dashboard/membership-qr/validate", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    routeMocks.getCurrentAdminUser.mockReset();
    routeMocks.getServerSupabaseEnv.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);

    routeMocks.getCurrentAdminUser.mockResolvedValue({
      id: "0f0d1d0f-9f89-4b70-a1e8-88f9d5b31413",
      email: "staff@gym.test",
    });
    routeMocks.getServerSupabaseEnv.mockReturnValue({
      url: "https://project.supabase.co",
      anonKey: "anon-key",
      serviceRoleKey: "service-role-key",
    });
    routeMocks.getDashboardMembershipScanResultByToken.mockReset();
    routeMocks.parseMembershipQrScanToken.mockReset();
  });

  it("rejects unauthenticated dashboard calls", async () => {
    routeMocks.getCurrentAdminUser.mockResolvedValue(null);

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/dashboard/membership-qr/validate", {
        method: "POST",
        body: JSON.stringify({ scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      reasonCode: "forbidden",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the scanned value to the Supabase edge function", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          reasonCode: "ok",
          canEnter: true,
          validationLabel: "Membresia al dia",
          scannedToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
          publicValidationUrl:
            "https://novaforza.pe/validacion/membresia/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
          member: {
            id: "member-1",
            memberNumber: "NF-2026-0001",
            fullName: "Socio Titan",
            email: "socio@test.com",
            phone: null,
            status: "active",
            branchName: "Club Central",
            trainerName: "Coach Vega",
            membershipQrToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
            planTitle: "Membresia Base",
          },
          membershipRequest: {
            id: "request-1",
            requestNumber: "MEM-20260409-AAAAAA",
            status: "active",
            cycleStartsOn: "2026-04-01",
            cycleEndsOn: "2099-05-01",
            planTitle: "Membresia Base",
          },
          errorMessage: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/dashboard/membership-qr/validate", {
        method: "POST",
        body: JSON.stringify({ scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.reasonCode).toBe("ok");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/functions/v1/membership-qr-validate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer service-role-key",
          "x-dashboard-user-email": "staff@gym.test",
          "x-dashboard-user-id": "0f0d1d0f-9f89-4b70-a1e8-88f9d5b31413",
        }),
        body: JSON.stringify({ scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2" }),
      }),
    );
  });

  it("falls back to direct dashboard validation when the edge function is missing", async () => {
    fetchMock.mockResolvedValue(new Response("not found", { status: 404 }));
    routeMocks.parseMembershipQrScanToken.mockReturnValue(
      "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
    );
    routeMocks.getDashboardMembershipScanResultByToken.mockResolvedValue({
      cycleEndsOn: "2099-05-01",
      cycleStartsOn: "2026-04-01",
      member: {
        id: "member-1",
        memberNumber: "NF-2026-0001",
        fullName: "Socio Titan",
        email: "socio@test.com",
        phone: null,
        status: "active",
        branchName: "Club Central",
        supabaseUserId: "user-1",
        trainerUserId: "trainer-1",
        trainerName: "Coach Vega",
        trainingPlanLabel: null,
        membershipQrToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      },
      membershipRequestId: "request-1",
      planTitle: "Membresia Base",
      publicValidationUrl:
        "https://novaforza.pe/validacion/membresia/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      requestNumber: "MEM-20260409-AAAAAA",
      requestStatus: "active",
      validation: {
        status: "al_dia",
        label: "Membresia al dia",
        tone: "success",
        cycleStartsOn: "2026-04-01",
        cycleEndsOn: "2099-05-01",
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/dashboard/membership-qr/validate", {
        method: "POST",
        body: JSON.stringify({ scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.reasonCode).toBe("ok");
    expect(routeMocks.parseMembershipQrScanToken).toHaveBeenCalled();
    expect(routeMocks.getDashboardMembershipScanResultByToken).toHaveBeenCalledWith(
      "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
    );
  });
});
