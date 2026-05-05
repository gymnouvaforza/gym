// Covers dashboard member detail -> form value mapping for legacy fields.
import { describe, expect, it } from "vitest";

import type { DashboardMemberDetail } from "@/lib/data/gym-management";
import { toMemberFormValues } from "@/features/admin/members/services/member-mappers";

const baseDetail = {
  assignmentHistory: [],
  availableTemplates: [],
  financials: null,
  linkedUser: null,
  measurements: [],
  member: {
    activeRoutineId: null,
    branchName: "Sede principal",
    currentRoutineTitle: null,
    email: "laura.ramos@example.com",
    externalCode: "000123",
    fullName: "Laura Ramos",
    id: "member-1",
    joinDate: "2026-05-01",
    legacyNotes: "Codigo original preservado.",
    linkedUserEmail: null,
    linkedUserId: null,
    memberNumber: "NF-000123",
    nextActionLabel: null,
    phone: "+51 999 111 222",
    planLabel: "Plan mensual",
    preferredSchedule: "Manana",
    profileCompleted: true,
    status: "active",
    trainerName: null,
    trainerUserId: null,
    updatedAt: "2026-05-01T00:00:00Z",
    address: "Av. Progreso 245",
    birthDate: "1990-05-15T00:00:00Z",
    districtOrUrbanization: "Urb. Central",
    gender: "F",
    occupation: "Administradora",
  },
  notes: "Ficha legacy migrada.",
  plan: {
    endsAt: "2026-05-31",
    id: "plan-1",
    label: "Plan mensual",
    notes: "Renovacion manual.",
    startedAt: "2026-05-01",
    status: "active",
  },
  statusMeta: {
    helperText: "Lista para consumo mobile.",
    label: "Activo",
  },
  trainingFeedback: {
    exercises: [],
    routine: null,
  },
} satisfies DashboardMemberDetail;

describe("toMemberFormValues", () => {
  it("maps legacy member fields into the form shape", () => {
    const result = toMemberFormValues(baseDetail);

    expect(result).toMatchObject({
      address: "Av. Progreso 245",
      districtOrUrbanization: "Urb. Central",
      externalCode: "000123",
      gender: "F",
      legacyNotes: "Codigo original preservado.",
      occupation: "Administradora",
      preferredSchedule: "Manana",
      profileCompleted: true,
    });
    // birthDate may come in ISO format from Supabase
    expect(result.birthDate).toBeDefined();
  });

  it("uses null and empty defaults when legacy fields are missing", () => {
    const result = toMemberFormValues({
      ...baseDetail,
      member: {
        ...baseDetail.member,
        address: null,
        birthDate: null,
        districtOrUrbanization: null,
        externalCode: null,
        gender: null,
        legacyNotes: null,
        occupation: null,
        preferredSchedule: null,
        profileCompleted: false,
      },
    });

    expect(result).toMatchObject({
      address: null,
      birthDate: null,
      districtOrUrbanization: null,
      externalCode: "",
      gender: null,
      legacyNotes: null,
      occupation: null,
      preferredSchedule: null,
      profileCompleted: false,
    });
  });
});
