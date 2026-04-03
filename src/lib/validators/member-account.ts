import { z } from "zod";

export interface MemberAccountProfileValues {
  email: string;
  fullName: string;
  phone?: string | null;
}

export const memberAccountProfileSchema = z.object({
  email: z.string().trim().email("Introduce un email valido."),
  fullName: z.string().trim().min(2, "Indica tu nombre visible.").max(120),
  phone: z.string().trim().max(40).nullable().optional(),
});

export interface MemberAccountPasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const memberAccountPasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Introduce tu contrasena actual."),
    newPassword: z.string().min(6, "La nueva contrasena debe tener al menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Repite la nueva contrasena."),
  })
  .superRefine((values, context) => {
    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contrasenas no coinciden.",
        path: ["confirmPassword"],
      });
    }
  });

export interface MemberAccountDeleteValues {
  currentPassword: string;
  confirmationText: string;
}

export const memberAccountDeleteSchema = z.object({
  currentPassword: z.string().min(6, "Introduce tu contrasena actual."),
  confirmationText: z
    .string()
    .trim()
    .min(1, "Escribe ELIMINAR para confirmar.")
    .refine((value) => value === "ELIMINAR", "Escribe ELIMINAR para confirmar."),
});
