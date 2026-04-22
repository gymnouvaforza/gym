import { z } from "zod";

function nullableTrimmedString(max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }, z.string().max(max).nullable());
}

export const memberPaymentMethodSchema = z.enum([
  "cash",
  "yape",
  "plin",
  "bank_transfer",
]);

export const memberPaymentSchema = z.object({
  membershipId: z.string().uuid(),
  amount: z.coerce
    .number()
    .positive("El importe debe ser mayor que cero.")
    .max(99999, "El importe supera el limite permitido."),
  method: memberPaymentMethodSchema,
  reference: nullableTrimmedString(255).optional(),
  memberEmail: z
    .preprocess((value) => {
      if (typeof value !== "string") {
        return value ?? null;
      }

      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    }, z.email().nullable())
    .optional(),
  memberName: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value ?? "";
    }

    return value.trim();
  }, z.string().max(160)),
});

export type MemberPaymentInput = z.input<typeof memberPaymentSchema>;
