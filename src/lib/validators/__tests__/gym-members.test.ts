// Covers dashboard member form validation, including legacy Excel master fields.
import { memberFormSchema } from "@/lib/validators/gym-members";

const validMemberFormPayload = {
  externalCode: "000123",
  linkedUserId: null,
  trainerUserId: null,
  fullName: "Laura Ramos",
  email: "laura.ramos@example.com",
  phone: "+51 999 111 222",
  status: "active",
  birthDate: "1990-05-15",
  gender: "F",
  address: "Av. Progreso 245",
  districtOrUrbanization: "Urb. Central",
  occupation: "Administradora",
  preferredSchedule: "Manana",
  branchName: "Sede principal",
  notes: "Socia legacy migrada desde Excel.",
  legacyNotes: "Codigo original preservado.",
  joinDate: "2026-05-01",
  planLabel: "Plan mensual",
  planStatus: "active",
  planStartedAt: "2026-05-01",
  planEndsAt: "2026-05-31",
  planNotes: "Renovacion manual.",
};

describe("memberFormSchema", () => {
  it("accepts legacy external codes with leading zeroes", () => {
    const result = memberFormSchema.safeParse(validMemberFormPayload);

    expect(result.success).toBe(true);
  });

  it("rejects an empty external code", () => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      externalCode: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts ISO birth dates", () => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      birthDate: "1990-05-15",
    });

    expect(result.success).toBe(true);
  });

  it("rejects localized birth date formats", () => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      birthDate: "15/05/1990",
    });

    expect(result.success).toBe(false);
  });

  it.each(["M", "F"])("accepts gender %s", (gender) => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      gender,
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsupported gender values", () => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      gender: "X",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes empty nullable legacy fields to null", () => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      birthDate: "",
      gender: "",
      address: "",
      districtOrUrbanization: "  ",
      occupation: "",
      preferredSchedule: "",
      legacyNotes: "",
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      birthDate: null,
      gender: null,
      address: null,
      districtOrUrbanization: null,
      occupation: null,
      preferredSchedule: null,
      legacyNotes: null,
    });
  });

  it.each(["expired", "frozen"])("accepts dashboard-only status %s", (status) => {
    const result = memberFormSchema.safeParse({
      ...validMemberFormPayload,
      status,
    });

    expect(result.success).toBe(true);
  });

  it("defaults profileCompleted to false", () => {
    const result = memberFormSchema.safeParse(validMemberFormPayload);

    expect(result.success).toBe(true);
    expect(result.data?.profileCompleted).toBe(false);
  });
});
