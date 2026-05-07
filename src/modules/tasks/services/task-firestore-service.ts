import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import type { Task } from "@/modules/tasks/services/types/task-types"

const TASKS_COLLECTION = "tasks"

export function subscribeToTasks(
  callback: (tasks: Task[]) => void,
  onError?: (err: Error) => void
) {
  const tasksRef = collection(db, TASKS_COLLECTION)
  const q = query(tasksRef, orderBy("order", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((d) => {
        const raw = d.data()
        const data = raw as Omit<Task, "id"> & { id?: string; createdAt?: unknown; updatedAt?: unknown }
        const tsCreatedAt = data.createdAt as { toDate?: () => Date } | null | undefined
        const tsUpdatedAt = data.updatedAt as { toDate?: () => Date } | null | undefined
        return {
          ...data,
          id: data.id ?? d.id,
          createdAt: tsCreatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          updatedAt: tsUpdatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        } as Task
      })
      callback(tasks)
    },
    (error) => {
      console.error("Firestore subscription error:", error)
      onError?.(error)
    }
  )
}

// Use setDoc with task.id as document ID so UPDATE/DELETE can find the same document.
// addDoc would generate a random Firestore auto-ID, causing all mutations to silently fail.
export async function addTaskToFirestore(task: Task): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, task.id)
  await setDoc(docRef, {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateTaskInFirestore(task: Task): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, task.id)
  await updateDoc(docRef, {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId ?? null,
    dueDate: task.dueDate ?? null,
    tags: task.tags ?? [],
    attachments: task.attachments ?? [],
    order: task.order ?? 0,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTaskFromFirestore(taskId: string): Promise<void> {
  const docRef = doc(db, TASKS_COLLECTION, taskId)
  await deleteDoc(docRef)
}
