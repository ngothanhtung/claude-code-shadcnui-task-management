import { z } from "zod"

export const registerUserSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  status: z.string(),
  note: z.string().optional(),
  createdAt: z.string().optional(),
})

export type RegisterUserItem = z.infer<typeof registerUserSchema>
