import { doc, serverTimestamp, writeBatch } from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import type { Task, TaskStatus } from "@/modules/tasks/services/types/task-types"

interface MoveTaskParams {
  taskId: string
  fromStatus: TaskStatus
  toStatus: TaskStatus
  newOrder: number
  columnTasks: Task[]
}

export async function batchMoveTask({
  taskId,
  fromStatus,
  toStatus,
  newOrder,
  columnTasks,
}: MoveTaskParams) {
  const batch = writeBatch(db)

  if (fromStatus === toStatus) {
    // Same-column reorder: re-index all tasks in the column
    const sorted = [...columnTasks]
      .filter((t) => t.status === fromStatus)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const movedTask = sorted.find((t) => t.id === taskId)
    if (!movedTask) return

    const reordered = arrayMove(sorted, sorted.indexOf(movedTask), newOrder)

    reordered.forEach((task, index) => {
      if (task.order !== index) {
        batch.update(doc(db, "tasks", task.id), {
          order: index,
          updatedAt: serverTimestamp(),
        })
      }
    })
  } else {
    // Cross-column move: re-index source column, update moved task, re-index destination column
    const fromColumn = columnTasks
      .filter((t) => t.status === fromStatus)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    const toColumn = columnTasks
      .filter((t) => t.status === toStatus)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    // Re-index source column
    fromColumn.forEach((task, index) => {
      if (task.order !== index) {
        batch.update(doc(db, "tasks", task.id), {
          order: index,
          updatedAt: serverTimestamp(),
        })
      }
    })

    // Update the moved task
    batch.update(doc(db, "tasks", taskId), {
      status: toStatus,
      order: newOrder,
      updatedAt: serverTimestamp(),
    })

    // Re-index destination column (skip the moved task)
    toColumn
      .filter((t) => t.id !== taskId)
      .forEach((task, index) => {
        const adjustedIndex = index >= newOrder ? index + 1 : index
        if (task.order !== adjustedIndex) {
          batch.update(doc(db, "tasks", task.id), {
            order: adjustedIndex,
            updatedAt: serverTimestamp(),
          })
        }
      })
  }

  await batch.commit()
}

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const result = [...array]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}
