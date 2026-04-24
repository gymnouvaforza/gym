import { z } from "zod";

export const trainingZoneIconSchema = z.enum(["dumbbell", "flame", "heart-pulse", "users", "bike"]);

const optionalUrlOrHash = z
  .string()
  .trim()
  .max(500, "Maximo 500 caracteres.")
  .optional()
  .or(z.literal(""));

export const trainingZoneSchema = z.object({
  id: z.string().uuid("El identificador no es valido."),
  slug: z
    .string()
    .trim()
    .min(2, "El slug es obligatorio.")
    .max(80, "Maximo 80 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minusculas, numeros y guiones."),
  title: z.string().trim().min(2, "El titulo es obligatorio.").max(100, "Maximo 100 caracteres."),
  short_label: z.string().trim().min(2, "La etiqueta es obligatoria.").max(32, "Maximo 32 caracteres."),
  subtitle: z.string().trim().max(180, "Maximo 180 caracteres.").optional().or(z.literal("")),
  description: z.string().trim().min(12, "La descripcion necesita mas contexto.").max(360, "Maximo 360 caracteres."),
  icon: trainingZoneIconSchema,
  video_url: z.string().trim().min(1, "El video es obligatorio.").max(600, "Maximo 600 caracteres."),
  poster_url: z.string().trim().max(600, "Maximo 600 caracteres.").optional().or(z.literal("")),
  cta_label: z.string().trim().max(60, "Maximo 60 caracteres.").optional().or(z.literal("")),
  cta_href: optionalUrlOrHash,
  order_index: z.number().int().min(0, "El orden no puede ser negativo."),
  active: z.boolean(),
});

export const trainingZonesSchema = z.object({
  trainingZones: z
    .array(trainingZoneSchema)
    .min(1, "Necesitas al menos una zona editable.")
    .max(7, "No puedes gestionar más de 7 zonas de entrenamiento."),
});

export type TrainingZoneValues = z.infer<typeof trainingZoneSchema>;
export type TrainingZonesValues = z.infer<typeof trainingZonesSchema>;
