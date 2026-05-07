import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from "firebase/storage"

import { storage } from "@/lib/firebase/client"
import type { TaskAttachment } from "@/modules/tasks/services/types/task-types"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".msi",
  ".ps1",
  ".vbs",
  ".jar",
  ".dll",
  ".com",
])

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "application/pdf",
  "text/",
  "application/zip",
  "application/x-zip",
]

const ALLOWED_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
])

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum size of 50 MB.`,
    }
  }

  const ext = "." + file.name.split(".").pop()!.toLowerCase()
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `File type "${ext}" is not allowed for security reasons.`,
    }
  }

  const isAllowedPrefix = ALLOWED_MIME_PREFIXES.some((prefix) =>
    file.type.startsWith(prefix)
  )
  const isAllowedExplicit = ALLOWED_MIME_TYPES.has(file.type)

  if (!isAllowedPrefix && !isAllowedExplicit) {
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not supported. Allowed: images, PDFs, text files, Office documents, and ZIP archives.`,
    }
  }

  return { valid: true }
}

export function buildStoragePath(taskId: string, fileId: string, fileName: string): string {
  return `attachments/${taskId}/${fileId}_${fileName}`
}

export interface UploadProgress {
  progress: number
  snapshot: UploadTaskSnapshot | null
}

export function uploadAttachment(
  taskId: string,
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<TaskAttachment> {
  return new Promise((resolve, reject) => {
    const validation = validateFile(file)
    if (!validation.valid) {
      reject(new Error(validation.error))
      return
    }

    const fileId = crypto.randomUUID()
    const storagePath = buildStoragePath(taskId, fileId, file.name)
    const storageRef = ref(storage, storagePath)

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedBy: userId,
      },
    })

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        )
        onProgress?.(progress)
      },
      (error) => {
        reject(error)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          const attachment: TaskAttachment = {
            id: fileId,
            fileName: file.name,
            storagePath,
            downloadURL,
            mimeType: file.type,
            size: file.size,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          }
          resolve(attachment)
        } catch (error) {
          reject(error)
        }
      }
    )
  })
}

export async function deleteAttachment(attachment: TaskAttachment): Promise<void> {
  const storageRef = ref(storage, attachment.storagePath)
  await deleteObject(storageRef)
}
