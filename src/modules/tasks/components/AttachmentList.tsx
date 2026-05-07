"use client"

import {
  Archive,
  File,
  FileArchive,
  FileImage,
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import type { TaskAttachment } from "@/modules/tasks/services/types/task-types"

interface AttachmentListProps {
  attachments: TaskAttachment[]
  onDelete: (attachment: TaskAttachment) => Promise<void>
  deletingId: string | null
  disabled?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(mimeType: string, fileName: string) {
  if (mimeType.startsWith("image/")) return FileImage
  if (mimeType === "application/pdf") return FileText
  if (mimeType.startsWith("text/")) return FileText

  const ext = "." + fileName.split(".").pop()!.toLowerCase()
  if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)) return FileArchive
  if ([".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"].includes(ext))
    return Archive

  return File
}

export function AttachmentList({
  attachments,
  onDelete,
  deletingId,
  disabled,
}: AttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Attachments ({attachments.length})
      </p>
      <ul className="divide-y divide-border rounded-lg border">
        {attachments.map((attachment) => {
          const Icon = getFileIcon(attachment.mimeType, attachment.fileName)
          const isDeleting = deletingId === attachment.id
          const dateStr =
            typeof attachment.uploadedAt === "string"
              ? formatDistanceToNow(new Date(attachment.uploadedAt), { addSuffix: true })
              : ""

          return (
            <li
              key={attachment.id}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <Icon className="h-8 w-8 shrink-0 text-muted-foreground" />

              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={attachment.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:underline truncate block"
                    >
                      {attachment.fileName}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{attachment.fileName}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(attachment.size)}
                  {dateStr && ` · ${dateStr}`}
                </p>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onDelete(attachment)}
                    disabled={isDeleting || disabled}
                    className={cn(
                      "shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer",
                      isDeleting && "opacity-50"
                    )}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete {attachment.fileName}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
