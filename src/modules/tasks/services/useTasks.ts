"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import {
  addTaskToFirestore,
  deleteTaskFromFirestore,
  subscribeToTasks,
  updateTaskInFirestore,
} from "@/modules/tasks/services/task-firestore-service"
import type { Task, TaskStatus } from "@/modules/tasks/services/types/task-types"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Store a ref to the latest tasks for use inside async callbacks
  // so we always rollback against the true current state, not a stale closure.
  const tasksRef = useRef<Task[]>([])
  tasksRef.current = tasks

  useEffect(() => {
    const unsubscribe = subscribeToTasks(
      (firestoreTasks) => {
        setTasks(firestoreTasks)
        setLoading(false)
      },
      () => {
        setLoading(false)
        toast.error("Failed to connect to Firestore. Please check your connection.")
      }
    )

    return () => unsubscribe()
  }, [])

  const addTask = useCallback(async (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])

    try {
      await addTaskToFirestore(newTask)
    } catch (error) {
      setTasks((prev) => prev.filter((t) => t.id !== newTask.id))
      toast.error("Failed to create task")
      throw error
    }
  }, [])

  const deleteTask = useCallback(async (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id))

    try {
      await deleteTaskFromFirestore(task.id)
    } catch (error) {
      setTasks((prev) => {
        if (prev.some((t) => t.id === task.id)) return prev
        return [...prev, task]
      })
      toast.error("Failed to delete task")
      throw error
    }
  }, [])

  const updateTask = useCallback(
    async (updated: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))

      try {
        await updateTaskInFirestore(updated)
      } catch (error) {
        // Rollback using the ref — always the true current state, not a stale closure
        setTasks(tasksRef.current)
        toast.error("Failed to update task")
        throw error
      }
    },
    []
  )

  // moveTask is synchronous — optimistic update only.
  // Firestore write is done by the caller (KanbanBoard) via batchMoveTask.
  const moveTask = useCallback(
    (taskId: string, toStatus: TaskStatus, newOrder: number, _allTasks: Task[]) => {
      setTasks((prev) => {
        const now = new Date().toISOString()

        // Step 1: apply the move
        const withMove = prev.map((t) =>
          t.id === taskId ? { ...t, status: toStatus, order: newOrder, updatedAt: now } : t
        )

        // Step 2: re-index the target column in order (immutable)
        const targetColumn = withMove
          .filter((t) => t.status === toStatus)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((task, idx) => ({ ...task, order: idx }))

        // Step 3: merge back — replace column items with re-indexed versions
        const taskIds = new Set(targetColumn.map((t) => t.id))
        const rest = withMove.filter((t) => !taskIds.has(t.id))

        return [...rest, ...targetColumn]
      })
    },
    []
  )

  const restoreTask = useCallback((task: Task) => {
    setTasks((prev) => {
      if (prev.some((t) => t.id === task.id)) return prev
      return [...prev, task]
    })
  }, [])

  const groupedTasks = useCallback(
    (status: TaskStatus) =>
      tasks
        .filter((t) => t.status === status)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tasks]
  )

  return {
    tasks,
    loading,
    addTask,
    deleteTask,
    updateTask,
    moveTask,
    restoreTask,
    groupedTasks,
  }
}
