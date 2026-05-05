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

function nullableDateString() {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value ?? null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable());
}

export const membershipRequestStatusSchema = z.enum([
  "requested",
  "confirmed",
  "active",
  "paused",
  "expired",
  "cancelled",
]);

export const membershipRequestDatesSchema = z.object({
  cycleStartsOn: z.string().trim().min(10, "La fecha de inicio es obligatoria."),
  cycleEndsOn: z.string().trim().min(10, "La fecha de fin es obligatoria."),
});

export type MembershipRequestDatesInput = z.input<typeof membershipRequestDatesSchema>;

export const membershipPlanFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "El codigo es obligatorio.")
      .regex(/^[A-Z0-9][A-Z0-9\-]*[A-Z0-9]$/i, "Usa solo letras, numeros y guiones."),
    title: z.string().trim().min(2, "El titulo es obligatorio.").max(120),
    description: z.preprocess((value) => {
      if (typeof value !== "string") {
        return value ?? null;
      }

      const trimmed = value.trim();
      return trimmed ? trimmed : null;
    }, z.string().max(1000).nullable()),
    price_amount: z.coerce.number().min(0, "El precio no puede ser negativo."),
    duration_days: z.coerce
      .number()
      .int("La duracion debe ser un numero entero.")
      .positive("La duracion debe ser mayor que cero.")
      .max(3650),
    is_freezable: z.boolean().default(false),
    max_freeze_days: z.coerce.number().int().min(0).max(365).default(0),
    bonus_days: z.coerce.number().int().min(0).max(365).default(0),
  })
  .superRefine((value, ctx) => {
    if (value.is_freezable && value.max_freeze_days <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indica al menos un dia de congelamiento.",
        path: ["max_freeze_days"],
      });
    }
  });

export type MembershipPlanFormInput = z.input<typeof membershipPlanFormSchema>;
export type MembershipPlanFormValues = z.infer<typeof membershipPlanFormSchema>;

export const membershipPlanReserveSchema = z.object({
  membershipPlanId: z.string().uuid(),
  notes: nullableTrimmedString(1000).optional(),
});

export type MembershipPlanReserveInput = z.input<typeof membershipPlanReserveSchema>;

export const membershipRequestAnnotationSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "Escribe una anotacion mas concreta.")
    .max(1000, "La anotacion supera el limite operativo."),
});

export type MembershipRequestAnnotationInput = z.input<
  typeof membershipRequestAnnotationSchema
>;

export const membershipPaymentEntrySchema = z.object({
  amount: z
    .number()
    .positive("El importe debe ser mayor que cero.")
    .max(99999, "El importe supera el limite permitido."),
  note: nullableTrimmedString(1000).optional(),
});

export type MembershipPaymentEntryInput = z.input<typeof membershipPaymentEntrySchema>;

export const membershipAdminCreateRequestSchema = z
  .object({
    memberId: z.string().uuid(),
    membershipPlanId: z.string().uuid(),
    notes: nullableTrimmedString(1000).optional(),
    cycleStartsOn: nullableDateString().optional(),
    cycleEndsOn: nullableDateString().optional(),
    renewsFromRequestId: z.string().uuid().nullable().optional(),
    source: z
      .enum(["member-portal", "admin-dashboard", "renewal"])
      .default("admin-dashboard"),
  })
  .superRefine((value, ctx) => {
    if (value.cycleStartsOn && value.cycleEndsOn && value.cycleEndsOn < value.cycleStartsOn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin no puede ser anterior al inicio.",
        path: ["cycleEndsOn"],
      });
    }
  });

export type MembershipAdminCreateRequestInput = z.input<
  typeof membershipAdminCreateRequestSchema
>;

export const membershipValidationTokenSchema = z.string().uuid();
