import { z } from "zod"

export const memberSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  joinDate: z.string(),
  branchName: z.string().min(1, "Sede requerida"),
  status: z.enum(["active", "debt", "inactive", "frozen"]).default("active"),
  balance: z.number().default(0),
})

export type MemberFormData = z.infer<typeof memberSchema>
