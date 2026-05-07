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

  const upload = useCallback(
    async (file: File) => {
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error)
        return
      }

      setUploadState({ isUploading: true, progress: 0, fileName: file.name })

      try {
        const attachment: TaskAttachment = await uploadAttachment(
          task.id,
          file,
          userId,
          (progress) => {
            setUploadState((prev) => ({ ...prev, progress }))
          }
        )

        const updated: Task = {
          ...task,
          attachments: [...(task.attachments ?? []), attachment],
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
    // task.id, task.attachments, and userId are primitives/references that are always
    // up-to-date when upload() is called — they only change between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task.id, userId]
  )

  const remove = useCallback(
    async (attachment: TaskAttachment) => {
      try {
        await deleteAttachment(attachment)

        const updated: Task = {
          ...task,
          attachments: (task.attachments ?? []).filter((a) => a.id !== attachment.id),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [task.id, onTaskUpdate]
  )

  // Always read from task prop so this is never stale — the parent re-renders
  // whenever Firestore data changes (via useTasks subscribeToTasks).
  const attachments: TaskAttachment[] = task.attachments ?? []

  return {
    attachments,
    uploadState,
    upload,
    remove,
  }
}
