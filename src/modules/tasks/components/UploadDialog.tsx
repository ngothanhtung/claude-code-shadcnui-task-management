"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import { Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { AttachmentList } from "@/modules/tasks/components/AttachmentList"
import { AttachmentUploader } from "@/modules/tasks/components/AttachmentUploader"
import { useAttachments } from "@/modules/tasks/services/useAttachments"
import type { Task } from "@/modules/tasks/services/types/task-types"

export interface UploadDialogHandle {
  open: () => void
}

interface UploadDialogProps {
  task: Task
  onTaskUpdate: (updated: Task) => Promise<void>
  userId: string
}

export const UploadDialog = forwardRef<UploadDialogHandle, UploadDialogProps>(
  ({ task, onTaskUpdate, userId }, ref) => {
    const [open, setOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const { attachments, uploadState, upload, remove } = useAttachments({
      task,
      onTaskUpdate: async (updated) => {
        await onTaskUpdate(updated)
      },
      userId,
    })

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
    }))

    const handleDelete = async (attachment: Parameters<typeof remove>[0]) => {
      setDeletingId(attachment.id)
      try {
        await remove(attachment)
      } finally {
        setDeletingId(null)
      }
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-120">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments — {task.title}
            </DialogTitle>
            <DialogDescription>
              Upload files or manage existing attachments for this task.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <AttachmentUploader
              onUpload={upload}
              uploadState={uploadState}
            />

            <AttachmentList
              attachments={attachments}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

UploadDialog.displayName = "UploadDialog"
