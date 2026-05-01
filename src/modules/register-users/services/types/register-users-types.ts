import { z } from "zod"

export function registerUserSchema() {
  return z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    message: z.string().optional(),
    createdAt: z.string().optional(),
  })
}

export type RegisterUserItem = z.infer<ReturnType<typeof registerUserSchema>>
