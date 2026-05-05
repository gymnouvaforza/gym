// Covers membership plan form validation rules used by dashboard plan management.
import { membershipPlanFormSchema } from "@/lib/validators/memberships";

describe("membershipPlanFormSchema", () => {
  it("accepts freezable plans with freeze days", () => {
    const result = membershipPlanFormSchema.safeParse({
      code: "PM-1M",
      title: "Plan Mensual",
      description: "Acceso completo",
      price_amount: 99,
      duration_days: 30,
      is_freezable: true,
      max_freeze_days: 15,
      bonus_days: 3,
    });

    expect(result.success).toBe(true);
  });

  it("rejects freezable plans without freeze days", () => {
    const result = membershipPlanFormSchema.safeParse({
      code: "PM-3M",
      title: "Plan Trimestral",
      description: null,
      price_amount: 249,
      duration_days: 90,
      is_freezable: true,
      max_freeze_days: 0,
      bonus_days: 0,
    });

    expect(result.success).toBe(false);
  });

  it("accepts non-freezable plans with defaults", () => {
    const result = membershipPlanFormSchema.safeParse({
      code: "PM-12M",
      title: "Plan Anual",
      price_amount: 899,
      duration_days: 365,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      is_freezable: false,
      max_freeze_days: 0,
      bonus_days: 0,
    });
  });

  it("rejects negative bonus days", () => {
    const result = membershipPlanFormSchema.safeParse({
      code: "PM-1M",
      title: "Plan Mensual",
      description: null,
      price_amount: 99,
      duration_days: 30,
      is_freezable: false,
      max_freeze_days: 0,
      bonus_days: -1,
    });

    expect(result.success).toBe(false);
  });
});
