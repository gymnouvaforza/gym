import { describe, expect, it } from "vitest";

import { marketingContentSchema } from "@/lib/validators/marketing";

describe("marketingContentSchema", () => {
  it("accepts marketing content with team members", () => {
    const parsed = marketingContentSchema.parse({
      plans: [
        {
          id: "plan-1",
          title: "Plan",
          description: "",
          price_label: "S/99",
          billing_label: "/mes",
          badge: "",
          is_featured: true,
          is_active: true,
          order: 0,
          features: [{ label: "Acceso libre", included: true }],
        },
      ],
      scheduleRows: [
        {
          id: "row-1",
          label: "Lunes",
          description: "",
          opens_at: "06:00 AM",
          closes_at: "10:00 PM",
          is_active: true,
          order: 0,
        },
      ],
      teamMembers: [
        {
          id: "trainer-1",
          name: "Coach Uno",
          role: "Fuerza",
          bio: "Bio valida con suficiente detalle para pasar la validacion.",
          image_url: "https://example.com/coach-uno.png",
          is_active: true,
          order: 0,
        },
      ],
    });

    expect(parsed.teamMembers).toHaveLength(1);
    expect(parsed.teamMembers[0]?.name).toBe("Coach Uno");
  });

  it("rejects team members with missing bio", () => {
    const result = marketingContentSchema.safeParse({
      plans: [
        {
          id: "plan-1",
          title: "Plan",
          description: "",
          price_label: "S/99",
          billing_label: "/mes",
          badge: "",
          is_featured: true,
          is_active: true,
          order: 0,
          features: [{ label: "Acceso libre", included: true }],
        },
      ],
      scheduleRows: [
        {
          id: "row-1",
          label: "Lunes",
          description: "",
          opens_at: "06:00 AM",
          closes_at: "10:00 PM",
          is_active: true,
          order: 0,
        },
      ],
      teamMembers: [
        {
          id: "trainer-1",
          name: "Coach Uno",
          role: "Fuerza",
          bio: "Corta",
          image_url: "https://example.com/coach-uno.png",
          is_active: true,
          order: 0,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
