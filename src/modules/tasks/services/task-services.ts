import {
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import type { Task } from "./types/task-types"

export async function getTasks(): Promise<Task[]> {
  const snapshot = await getDocs(collection(db, "tasks"))

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Task
    return {
      ...data,
      id: data.id ?? docSnap.id,
    }
  })
}

export async function addTask(task: Task): Promise<void> {
  const { id, ...data } = task
  await setDoc(doc(db, "tasks", id), data, { merge: true })
}

export async function updateTask(
  id: string,
  data: Partial<Task>
): Promise<void> {
  const docRef = doc(db, "tasks", id)
  const { id: _id, ...payload } = data
  await updateDoc(docRef, payload)
}

export async function deleteTask(id: string): Promise<void> {
  const docRef = doc(db, "tasks", id)
  await deleteDoc(docRef)
}

export function getTaskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "completed").length,
    inProgress: tasks.filter((task) => task.status === "in progress").length,
    pending: tasks.filter((task) => task.status === "pending").length,
  }
}
