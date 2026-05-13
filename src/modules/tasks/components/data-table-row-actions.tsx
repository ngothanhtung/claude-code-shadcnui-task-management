"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Paperclip, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import { auth } from "@/lib/firebase/client"
import { priorities, statuses, tags } from "@/modules/tasks/services/task-mock-data"
import {
  taskFormSchema,
  type TaskFormDataInput,
} from "@/modules/tasks/services/types/task-types"
import type { Task } from "@/modules/tasks/services/types/task-types"
import {
  UploadDialog,
  type UploadDialogHandle,
} from "@/modules/tasks/components/UploadDialog"

interface DataTableRowActionsProps {
  row: Row<Task>
  onDelete?: (task: Task) => void
  onUpdate?: (task: Task) => Promise<void>
}

function toDateInputValue(value: Task["dueDate"]): string {
  if (!value) return ""
  const iso = new Date(value).toISOString()
  return iso.split("T")[0]
}

export function DataTableRowActions({
  row,
  onDelete,
  onUpdate,
}: DataTableRowActionsProps) {
  const task = row.original

  const [editOpen, setEditOpen] = useState(false)
  const uploadDialogRef = useRef<UploadDialogHandle>(null)

  const userId = auth.currentUser?.uid ?? "anonymous"

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormDataInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId ?? "",
      dueDate: toDateInputValue(task.dueDate),
      tags: task.tags ?? [],
    },
  })

  useEffect(() => {
    if (editOpen) {
      reset({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId ?? "",
        dueDate: toDateInputValue(task.dueDate),
        tags: task.tags ?? [],
      })
    }
  }, [editOpen, task, reset])

  const handleDelete = async () => {
    try {
      await onDelete?.(task)
      toast.success("Task deleted")
    } catch {
      // Error toast is handled by useTasks
    }
  }

  const onSubmit = async (data: TaskFormDataInput) => {
    const updated: Task = {
      ...task,
      title: data.title,
      description: data.description ?? "",
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      tags: data.tags ?? [],
      updatedAt: new Date().toISOString(),
    }

    try {
      await onUpdate?.(updated)
      setEditOpen(false)
    } catch (err) {
      console.error("Failed to save task:", err)
      // Error toast is handled by useTasks; keep dialog open so user can retry
    }
  }

  const toggleTag = (tagValue: string) => {
    const current: string[] = watch("tags") ?? []
    const exists = current.includes(tagValue)
    setValue("tags", exists ? current.filter((t) => t !== tagValue) : [...current, tagValue])
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => uploadDialogRef.current?.open()}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Attachments
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UploadDialog
        ref={uploadDialogRef}
        task={task}
        onTaskUpdate={onUpdate ?? (async () => {})}
        userId={userId}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-131.25">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title?.message && (
                <p className="text-sm text-red-500">{String(errors.title.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
                rows={2}
              />
              {errors.description?.message && (
                <p className="text-sm text-red-500">{String(errors.description.message)}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
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
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
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
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assigneeId">Assignee ID</Label>
                <Input id="edit-assigneeId" className="w-full" {...register("assigneeId")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input id="edit-dueDate" className="w-full" type="date" {...register("dueDate")} />
              </div>
            </div>

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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
