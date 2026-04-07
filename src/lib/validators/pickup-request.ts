import { z } from "zod";

export const pickupRequestAnnotationSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "Escribe una anotacion con algo de contexto.")
    .max(1000, "Manten la anotacion por debajo de 1000 caracteres."),
});

export const pickupRequestPaymentEntrySchema = z.object({
  amount: z.coerce
    .number()
    .positive("Indica un importe mayor que cero.")
    .max(999999, "El importe es demasiado alto para registrarlo desde esta vista."),
  note: z
    .string()
    .trim()
    .max(1000, "Manten la nota del pago por debajo de 1000 caracteres.")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export type PickupRequestAnnotationInput = z.input<typeof pickupRequestAnnotationSchema>;
export type PickupRequestAnnotationValues = z.output<typeof pickupRequestAnnotationSchema>;
export type PickupRequestPaymentEntryInput = z.input<typeof pickupRequestPaymentEntrySchema>;
export type PickupRequestPaymentEntryValues = z.output<typeof pickupRequestPaymentEntrySchema>;
