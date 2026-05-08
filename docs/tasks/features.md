# Task Features

## File Attachments

Upload and manage file attachments on any task.

### Storage Structure

```
attachments/{taskId}/{fileId}_{fileName}
```

### Firestore Schema

Each task document in `tasks/{taskId}` contains an `attachments` array:

```typescript
attachments: Array<{
  id: string // uuid
  fileName: string // original name
  storagePath: string // full storage path
  downloadURL: string // public download URL
  mimeType: string // MIME type
  size: number // bytes
  uploadedBy: string // userId
  uploadedAt: Timestamp
}>
```

### Validation Rules

| Rule               | Value                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| Max file size      | 50 MB per file                                                                |
| Blocked extensions | `.exe`, `.sh`, `.bat`, `.cmd`, `.msi`, `.ps1`, `.vbs`, `.jar`, `.dll`, `.com` |
| Allowed MIME types | `image/*`, `application/pdf`, `text/*`, Office docs, `application/zip`        |

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /attachments/{taskId}/{fileId}_{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size <= 50 * 1024 * 1024
        && request.resource.contentType.matches('image/.*')
        || request.resource.contentType.matches('application/pdf')
        || request.resource.contentType.matches('text/.*')
        || request.resource.contentType.matches('application/zip')
        || request.resource.contentType.matches('application/(msword|vnd\\..*)');
      allow delete: if request.auth != null;
    }
  }
}
```

### Architecture

| File                                                      | Purpose                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/modules/tasks/services/attachmentService.ts`         | `validateFile()`, `uploadAttachment()`, `deleteAttachment()` — all Storage operations |
| `src/modules/tasks/services/useAttachments.ts`            | Hook managing upload/delete lifecycle and state                                       |
| `src/modules/tasks/components/AttachmentUploader.tsx`     | Drag-and-drop zone + progress bar                                                     |
| `src/modules/tasks/components/AttachmentList.tsx`         | File list with type icons, size, relative date, delete button                         |
| `src/modules/tasks/components/UploadDialog.tsx`           | Standalone dialog; opened via `forwardRef` + `useImperativeHandle`                    |
| `src/modules/tasks/components/data-table-row-actions.tsx` | Row actions dropdown (Edit, Attachments, Delete)                                      |
| `src/modules/tasks/services/types/task-types.ts`          | `TaskAttachment` type + `attachments` field on `Task`                                 |

### UI Flow

1. User clicks the row actions menu → selects **Attachments**
2. `UploadDialog` opens with the current task's attachments list
3. User drags/drops or clicks to select files
4. `uploadAttachment()` runs with `uploadBytesResumable` for progress tracking
5. On success, `onTaskUpdate()` syncs the new attachment to Firestore → `subscribeToTasks` re-fires → table re-renders with updated data
6. `AttachmentList` always derives from `task.attachments` (no local state) — no stale data

### Key Design Decisions

- **Separate dialog**: Attachments live in their own `UploadDialog`, not merged into the Edit dialog
- **No local attachments state**: `useAttachments` reads `task.attachments` from the prop on every render to avoid stale closures after Firestore syncs
- **No `any`**: Strict TypeScript throughout; `UploadTaskSnapshot` typed via `firebase/storage`
- **No real-time**: Uses one-shot `uploadBytesResumable`, not `onSnapshot` — consistent with project conventions
