"use client"

import { useState } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { auth } from "@/lib/firebase/client"
import { AttachmentList } from "@/modules/tasks/components/AttachmentList"
import { AttachmentUploader } from "@/modules/tasks/components/AttachmentUploader"
import { priorities, statuses, tags } from "@/modules/tasks/services/task-mock-data"
import type { Task } from "@/modules/tasks/services/types/task-types"
import { useAttachments } from "@/modules/tasks/services/useAttachments"

interface DataTableRowActionsProps {
  row: Row<Task>
  onDelete?: (task: Task) => void
  onUpdate?: (task: Task) => void
}

export function DataTableRowActions({
  row,
  onDelete,
  onUpdate,
}: DataTableRowActionsProps) {
  const task = row.original
  const now = new Date().toISOString()

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editData, setEditData] = useState<Task>(task)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null)

  const userId = auth.currentUser?.uid ?? "anonymous"

  const { uploadState, upload, remove } = useAttachments({
    task: editData,
    onTaskUpdate: async (updated) => {
      setEditData(updated)
      await onUpdate?.(updated)
    },
    userId,
  })

  const handleDelete = async () => {
    try {
      await onDelete?.(task)
      toast.success("Task deleted")
    } catch {
      // Error toast is handled by useTasks
    }
  }

  const handleDeleteAttachment = async (attachment: Parameters<typeof remove>[0]) => {
    setDeletingAttachmentId(attachment.id)
    try {
      await remove(attachment)
    } finally {
      setDeletingAttachmentId(null)
    }
  }

  const handleEdit = async () => {
    setSubmitting(true)
    const updated: Task = {
      ...task,
      ...editData,
      attachments: editData.attachments ?? [],
      updatedAt: now,
    }
    try {
      await onUpdate?.(updated)
      setEditData(updated)
      setOpen(false)
    } catch {
      // Error toast is handled by useTasks; keep dialog open so user can retry
    } finally {
      setSubmitting(false)
    }
  }

  const toggleTag = (tagValue: string) => {
    setEditData((prev) => {
      const current = prev.tags ?? []
      const exists = current.includes(tagValue)
      return {
        ...prev,
        tags: exists ? current.filter((t) => t !== tagValue) : [...current, tagValue],
      }
    })
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
            onClick={() => {
              setEditData(task)
              setOpen(true)
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setEditData(task)
              setOpen(true)
            }}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-131.25">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
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
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editData.priority}
                  onValueChange={(value) =>
                    setEditData((prev) => ({ ...prev, priority: value as Task["priority"] }))
                  }
                >
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assigneeId">Assignee ID</Label>
                <Input
                  id="edit-assigneeId"
                  className="w-full"
                  value={editData.assigneeId ?? ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, assigneeId: e.target.value || undefined }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
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

            <Separator />

            <AttachmentUploader
              onUpload={upload}
              uploadState={uploadState}
              disabled={submitting}
            />

            <AttachmentList
              attachments={editData.attachments ?? []}
              onDelete={handleDeleteAttachment}
              deletingId={deletingAttachmentId}
              disabled={submitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting} className="cursor-pointer">
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
