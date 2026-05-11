"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format, isPast, isToday } from "date-fns"
import {
  AlertCircle,
  Calendar,
  GripVertical,
  Pencil,
  Trash2,
  User,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { toast } from "sonner"

import { priorities, statuses, tags } from "@/modules/tasks/services/task-mock-data"
import { taskFormSchema } from "@/modules/tasks/services/types/task-types"
import type { Task } from "@/modules/tasks/services/types/task-types"

interface KanbanCardProps {
  task: Task
  isDragging?: boolean
  onUpdate?: (task: Task) => void
  onDelete?: (task: Task) => void
}

export function KanbanCard({ task, isDragging, onUpdate, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<Task>(task)
  const [submitting, setSubmitting] = useState(false)

  // Sync editData when task prop changes (e.g., after save updates parent state)
  useEffect(() => {
    if (!editOpen) {
      setEditData(task)
    }
  }, [task, editOpen])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const priorityConfig = priorities.find((p) => p.value === task.priority)
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate)
  const isDueToday = dueDate && isToday(dueDate)

  const handleEditOpen = () => {
    setEditData(task)
    setEditOpen(true)
  }

  const handleSave = async () => {
    const parsed = taskFormSchema.safeParse(editData)
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => i.message)
      toast.error(issues[0] ?? "Invalid form data")
      return
    }

    setSubmitting(true)
    const updated: Task = { ...task, ...editData, updatedAt: new Date().toISOString() }
    try {
      await onUpdate?.(updated)
      setEditOpen(false)
    } catch (err) {
      console.error("Failed to save task:", err)
      // Error toast handled by useTasks
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete?.(task)
      toast.success("Task deleted")
    } catch {
      // Error toast handled by useTasks
    }
  }

  const toggleTag = (tagValue: string) => {
    setEditData((prev) => {
      const current = prev.tags ?? []
      const exists = current.includes(tagValue)
      return { ...prev, tags: exists ? current.filter((t) => t !== tagValue) : [...current, tagValue] }
    })
  }

  return (
    <>
      <div ref={setNodeRef} style={style} className="mb-2">
        <Card
          className={`cursor-pointer select-none group transition-shadow hover:shadow-md ${
            isDragging ? "shadow-lg ring-2 ring-primary" : ""
          }`}
        >
          <CardHeader className="p-3 pb-1">
            <div className="flex items-start justify-between gap-1">
              <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {priorityConfig && (
                  <span className="text-muted-foreground">
                    <priorityConfig.icon
                      className={`size-3.5 ${
                        task.priority === "high"
                          ? "text-red-500"
                          : task.priority === "medium"
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleEditOpen}
                  className="p-0.5 rounded hover:bg-muted cursor-pointer"
                  title="Edit"
                >
                  <Pencil className="size-3 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-0.5 rounded hover:bg-muted cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="size-3 text-muted-foreground hover:text-red-500" />
                </button>
                <button
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-muted"
                >
                  <GripVertical className="size-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 pt-1 space-y-2">
            <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {task.assigneeId && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="size-3" />
                  <span className="truncate max-w-20">{task.assigneeId}</span>
                </div>
              )}

              {dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${
                    isOverdue ? "text-red-500" : isDueToday ? "text-orange-500" : "text-muted-foreground"
                  }`}
                >
                  {isOverdue ? <AlertCircle className="size-3" /> : <Calendar className="size-3" />}
                  <span>{format(dueDate, "MMM d")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-131.25">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details. Click save when you are done.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kanban-edit-title">Title</Label>
              <Input
                id="kanban-edit-title"
                value={editData.title}
                onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kanban-edit-description">Description</Label>
              <Textarea
                id="kanban-edit-description"
                value={editData.description ?? ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, description: e.target.value || undefined }))
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) =>
                    setEditData((prev) => ({ ...prev, status: value as Task["status"] }))
                  }
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="cursor-pointer">
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
                <Label>Priority</Label>
                <Select
                  value={editData.priority}
                  onValueChange={(value) =>
                    setEditData((prev) => ({ ...prev, priority: value as Task["priority"] }))
                  }
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="cursor-pointer">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kanban-edit-assigneeId">Assignee ID</Label>
                <Input
                  id="kanban-edit-assigneeId"
                  className="w-full"
                  value={editData.assigneeId ?? ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, assigneeId: e.target.value || undefined }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kanban-edit-dueDate">Due Date</Label>
                <Input
                  id="kanban-edit-dueDate"
                  className="w-full"
                  type="date"
                  value={
                    editData.dueDate
                      ? new Date(editData.dueDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const selected = editData.tags?.includes(tag.value) ?? false
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={submitting} className="cursor-pointer">
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
