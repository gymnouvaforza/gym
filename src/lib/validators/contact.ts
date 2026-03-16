import { z } from "zod";

import { leadSchema } from "@/lib/validators/lead";

export const contactFormSchema = leadSchema.pick({
  name: true,
  email: true,
  phone: true,
  message: true,
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
