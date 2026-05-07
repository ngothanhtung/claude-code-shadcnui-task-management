"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { priorities, statuses, tags } from "@/modules/tasks/services/task-mock-data"
import type { Task } from "@/modules/tasks/services/types/task-types"

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type TaskFormData = z.infer<typeof taskFormSchema>

interface AddTaskModalProps {
  onAddTask?: (task: Task) => void
  trigger?: React.ReactNode
  defaultStatus?: TaskFormData["status"]
  defaultOrder?: number
}

const defaultFormData: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assigneeId: "",
  dueDate: "",
  tags: [],
}

export function AddTaskModal({ onAddTask, trigger, defaultStatus, defaultOrder = 0 }: AddTaskModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    ...defaultFormData,
    status: defaultStatus ?? defaultFormData.status,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const generateTaskId = () => {
    const number = Math.floor(Math.random() * 9000) + 1000
    return `TASK-${number}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const parsed = taskFormSchema.safeParse(formData)
    if (!parsed.success) {
      const newErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message
        }
      })
      setErrors(newErrors)
      return
    }

    setSubmitting(true)

    const now = new Date().toISOString()
    const newTask: Task = {
      id: generateTaskId(),
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId || undefined,
      dueDate: parsed.data.dueDate || undefined,
      tags: parsed.data.tags || [],
      attachments: [],
      order: defaultOrder,
      createdAt: now,
      updatedAt: now,
      createdBy: "user-current",
    }

    try {
      await onAddTask?.(newTask)
      setFormData({ ...defaultFormData, status: defaultStatus ?? "todo" })
      setErrors({})
      setOpen(false)
    } catch {
      // Error toast is handled by useTasks; keep form open so user can retry
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ ...defaultFormData, status: defaultStatus ?? "todo" })
    setErrors({})
    setOpen(false)
  }

  const toggleTag = (tagValue: string) => {
    setFormData((prev) => {
      const current = prev.tags ?? []
      const exists = current.includes(tagValue)
      return {
        ...prev,
        tags: exists ? current.filter((t) => t !== tagValue) : [...current, tagValue],
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="cursor-pointer">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-131.25">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className={errors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between">
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{formData.title.length}/200</p>
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the task..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as TaskFormData["status"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div className="flex items-center">
                        {s.icon && <s.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                        {s.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value as TaskFormData["priority"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <div className="flex items-center">
                        {p.icon && <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Assignee ID</Label>
              <Input
                id="assigneeId"
                placeholder="e.g. user-001"
                value={formData.assigneeId}
                onChange={(e) => setFormData((prev) => ({ ...prev, assigneeId: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = formData.tags?.includes(tag.value) ?? false
                return (
                  <Button
                    key={tag.value}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag.value)}
                    className="cursor-pointer h-7 text-xs"
                  >
                    {tag.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting ? "Creating..." : <><Plus className="w-4 h-4 mr-2" />Create Task</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
