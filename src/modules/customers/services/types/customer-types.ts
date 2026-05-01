import { z } from "zod"

export const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.string(),
  customerType: z.string(),
  address: z.string().optional(),
  notes: z.string().optional(),
  totalSpent: z.number().optional(),
  lastContact: z.string().optional(),
  createdAt: z.string(),
})

export type Customer = z.infer<typeof customerSchema>
