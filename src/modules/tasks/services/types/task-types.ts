import { z } from "zod"

export const taskPrioritySchema = z.enum(["low", "medium", "high"])
export const taskStatusSchema = z.enum(["todo", "in-progress", "done"])

export const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  storagePath: z.string(),
  downloadURL: z.string(),
  mimeType: z.string(),
  size: z.number(),
  uploadedBy: z.string(),
  uploadedAt: z.union([z.string(), z.number(), z.instanceof(Date)]),
})

export type TaskAttachment = z.infer<typeof attachmentSchema>

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().max(200),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  assigneeId: z.string().optional(),
  dueDate: z.union([z.string(), z.number(), z.instanceof(Date)]).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().optional().default(0),
  attachments: z.array(attachmentSchema).optional().default([]),
  createdAt: z.union([z.string(), z.number(), z.instanceof(Date)]),
  updatedAt: z.union([z.string(), z.number(), z.instanceof(Date)]),
  createdBy: z.string(),
})

export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
export type Task = z.infer<typeof taskSchema>

export const KANBAN_STATUSES: TaskStatus[] = ["todo", "in-progress", "done"]

export const KANBAN_COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
]
