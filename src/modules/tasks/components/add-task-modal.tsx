"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"

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

import {
  priorities,
  statuses,
  tags,
} from "@/modules/tasks/services/task-mock-data"
import {
  taskFormSchema,
  type TaskFormData,
} from "@/modules/tasks/services/types/task-types"
import type { Task } from "@/modules/tasks/services/types/task-types"

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

export function AddTaskModal({
  onAddTask,
  trigger,
  defaultStatus,
  defaultOrder = 0,
}: AddTaskModalProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      ...defaultFormData,
      status: defaultStatus ?? defaultFormData.status,
    },
  })

  const generateTaskId = () => {
    const number = Math.floor(Math.random() * 9000) + 1000
    return `TASK-${number}`
  }
  const onSubmit = async (data: TaskFormData) => {
    const now = new Date().toISOString()
    const newTask: Task = {
      id: generateTaskId(),
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate || undefined,
      tags: data.tags || [],
      attachments: [],
      order: defaultOrder,
      createdAt: now,
      updatedAt: now,
      createdBy: "user-current",
    }

    try {
      await onAddTask?.(newTask)
      reset({ ...defaultFormData, status: defaultStatus ?? "todo" })
      setOpen(false)
    } catch {
      // keep dialog open for retry; parent hook will show toast
    }
  }

  const handleCancel = () => {
    reset({ ...defaultFormData, status: defaultStatus ?? "todo" })
    setOpen(false)
  }

  const toggleTag = (tagValue: string) => {
    const current: string[] = watch("tags") ?? []
    const exists = current.includes(tagValue)
    const next = exists
      ? current.filter((t) => t !== tagValue)
      : [...current, tagValue]
    setValue("tags", next)
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between">
              {errors.title?.message && (
                <p className="text-sm text-red-500">
                  {String(errors.title.message)}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {(watch("title") || "").length}/200
              </p>
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide additional details about the task..."
              {...register("description")}
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <div className="flex items-center">
                            {s.icon && (
                              <s.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            )}
                            {s.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center">
                            {p.icon && (
                              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            )}
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigneeId">Assignee ID</Label>
              <Input
                id="assigneeId"
                placeholder="e.g. user-001"
                {...register("assigneeId")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = (watch("tags") ?? []).includes(tag.value)
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
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
