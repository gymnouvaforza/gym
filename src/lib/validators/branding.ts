import { z } from "zod";

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const brandingSchema = z.object({
  gym_name: z
    .string()
    .trim()
    .min(2, "El nombre del gimnasio es obligatorio.")
    .max(80, "Maximo 80 caracteres."),
  slogan: z
    .string()
    .trim()
    .max(140, "El slogan es demasiado largo.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(320, "La descripcion es demasiado larga.")
    .optional()
    .or(z.literal("")),
  primary_color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Formato de color hexadecimal invalido (ej: #d71920).")
    .default("#d71920"),
  secondary_color: z
    .string()
    .trim()
    .regex(hexColorRegex, "Formato de color hexadecimal invalido (ej: #111111).")
    .default("#111111"),
  logo_url: z.string().url("URL de logo invalida.").nullable().optional(),
  favicon_url: z.string().url("URL de favicon invalida.").nullable().optional(),
});

export type BrandingValues = z.infer<typeof brandingSchema>;
