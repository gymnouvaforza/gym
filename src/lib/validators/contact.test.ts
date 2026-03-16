import { contactFormSchema } from "@/lib/validators/contact";

describe("contactFormSchema", () => {
  it("accepts a valid lead payload", () => {
    const result = contactFormSchema.safeParse({
      name: "Laura",
      email: "laura@example.com",
      phone: "+34 600 111 222",
      message: "Quiero pedir informacion sobre tarifas y horarios.",
    });

    expect(result.success).toBe(true);
  });

  it("rejects short messages", () => {
    const result = contactFormSchema.safeParse({
      name: "Laura",
      email: "laura@example.com",
      phone: "",
      message: "Hola",
    });

    expect(result.success).toBe(false);
  });
});
