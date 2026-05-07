"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"

import {
  deleteAttachment,
  uploadAttachment,
  validateFile,
} from "@/modules/tasks/services/attachmentService"
import type { TaskAttachment, Task } from "@/modules/tasks/services/types/task-types"

interface UseAttachmentsOptions {
  task: Task
  onTaskUpdate: (updated: Task) => Promise<void>
  userId: string
}

interface UploadState {
  isUploading: boolean
  progress: number
  fileName: string | null
}

export function useAttachments({ task, onTaskUpdate, userId }: UseAttachmentsOptions) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    fileName: null,
  })

  const attachments: TaskAttachment[] = task.attachments ?? []

  const upload = useCallback(
    async (file: File) => {
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      setUploadState({ isUploading: true, progress: 0, fileName: file.name })

      try {
        const attachment = await uploadAttachment(task.id, file, userId, (progress) => {
          setUploadState((prev) => ({ ...prev, progress }))
        })

        const updated: Task = {
          ...task,
          attachments: [...attachments, attachment],
        }
        await onTaskUpdate(updated)
        toast.success(`"${file.name}" uploaded successfully`)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload file"
        )
        throw error
      } finally {
        setUploadState({ isUploading: false, progress: 0, fileName: null })
      }
    },
    [task, attachments, userId, onTaskUpdate]
  )

  const remove = useCallback(
    async (attachment: TaskAttachment) => {
      try {
        await deleteAttachment(attachment)

        const updated: Task = {
          ...task,
          attachments: attachments.filter((a) => a.id !== attachment.id),
        }
        await onTaskUpdate(updated)
        toast.success(`"${attachment.fileName}" deleted`)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete attachment"
        )
        throw error
      }
    },
    [task, attachments, onTaskUpdate]
  )

  return {
    attachments,
    uploadState,
    upload,
    remove,
  }
}
