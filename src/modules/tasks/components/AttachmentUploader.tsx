"use client"

import { useCallback, useState } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import { Progress } from "@/components/ui/progress"
import { validateFile } from "@/modules/tasks/services/attachmentService"

interface AttachmentUploaderProps {
  onUpload: (file: File) => Promise<void>
  uploadState: {
    isUploading: boolean
    progress: number
    fileName: string | null
  }
  disabled?: boolean
}

export function AttachmentUploader({
  onUpload,
  uploadState,
  disabled,
}: AttachmentUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      for (const file of Array.from(files)) {
        const validation = validateFile(file)
        if (!validation.valid) {
          toast.error(validation.error)
          continue
        }

        try {
          await onUpload(file)
        } catch {
          // error toast is handled in useAttachments
        }
      }
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      e.target.value = ""
    },
    [handleFiles]
  )

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          (disabled || uploadState.isUploading) && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleInputChange}
          disabled={disabled || uploadState.isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-foreground">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Images, PDFs, text files, Office docs, ZIP — max 50 MB
        </p>
      </div>

      {uploadState.isUploading && uploadState.fileName && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground truncate">
            Uploading {uploadState.fileName}… {uploadState.progress}%
          </p>
          <Progress value={uploadState.progress} />
        </div>
      )}
    </div>
  )
}
