import { describe, expect, it } from "vitest";

import {
  normalizeMembershipQrToken,
  parseMembershipQrScannedValue,
  resolveMembershipQrValidation,
} from "@/lib/membership-qr";

const baseMember = {
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
} as const;

const baseRequest = {
  id: "request-1",
  requestNumber: "MEM-20260409-AAAAAA",
  status: "active",
  cycleStartsOn: "2026-04-01",
  cycleEndsOn: "2099-05-01",
  planTitle: "Membresia Base",
} as const;

describe("membership QR domain helpers", () => {
  it("extracts a UUID token from the public validation URL", () => {
    expect(
      parseMembershipQrScannedValue(
        "https://novaforza.pe/validacion/membresia/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      ),
    ).toBe("ff6ae4fd-b470-4db1-8d47-711fb01eb0a2");
  });

  it("rejects non-UUID values as invalid membership QR payloads", () => {
    expect(parseMembershipQrScannedValue("qr_token_legacy")).toBeNull();
    expect(parseMembershipQrScannedValue("https://example.com/otra/ruta")).toBeNull();
  });

  it("normalizes valid QR tokens and rejects empty values", () => {
    expect(normalizeMembershipQrToken(" ff6ae4fd-b470-4db1-8d47-711fb01eb0a2 ")).toBe(
      "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
    );
    expect(normalizeMembershipQrToken("")).toBeNull();
  });

  it("resolves an operational membership as allowed access", () => {
    const result = resolveMembershipQrValidation({
      scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      scannedToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      member: baseMember,
      membershipRequest: baseRequest,
      publicValidationUrl:
        "https://novaforza.pe/validacion/membresia/ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
    });

    expect(result.reasonCode).toBe("ok");
    expect(result.canEnter).toBe(true);
  });

  it("blocks access when the member has no operational request", () => {
    const result = resolveMembershipQrValidation({
      scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      scannedToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      member: baseMember,
      membershipRequest: null,
    });

    expect(result.reasonCode).toBe("inactive_membership");
    expect(result.canEnter).toBe(false);
  });

  it("blocks expired memberships explicitly", () => {
    const result = resolveMembershipQrValidation({
      scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      scannedToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      member: baseMember,
      membershipRequest: {
        ...baseRequest,
        cycleEndsOn: "2025-04-01",
      },
    });

    expect(result.reasonCode).toBe("expired_membership");
    expect(result.validationLabel).toMatch(/vencida/i);
  });

  it("blocks payments that are still pending activation", () => {
    const result = resolveMembershipQrValidation({
      scannedValue: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      scannedToken: "ff6ae4fd-b470-4db1-8d47-711fb01eb0a2",
      member: baseMember,
      membershipRequest: {
        ...baseRequest,
        status: "confirmed",
      },
    });

    expect(result.reasonCode).toBe("payment_pending");
    expect(result.canEnter).toBe(false);
  });
});
