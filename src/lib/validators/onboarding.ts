import { z } from "zod";

export const onboardingSchema = z.object({
  fullName: z.string().min(3, "El nombre completo es obligatorio."),
  email: z.string().email("Introduce un email valido."),
  phone: z.string().min(9, "Introduce un numero de telefono valido."),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
  confirmPassword: z.string(),
  membershipPlanId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrasenas no coinciden.",
  path: ["confirmPassword"],
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
