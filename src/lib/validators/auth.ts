import { z } from "zod";

export const loginSchema = z.object({
  identity: z.string().trim().min(2, "Introduce un email o usuario valido."),
  password: z.string().min(4, "La contrasena es obligatoria."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Introduce un email valido."),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
