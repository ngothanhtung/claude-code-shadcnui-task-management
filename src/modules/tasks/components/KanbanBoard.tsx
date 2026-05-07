"use client"

import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useState } from "react"
import { toast } from "sonner"

import { KanbanCard } from "@/modules/tasks/components/KanbanCard"
import { KanbanColumn } from "@/modules/tasks/components/KanbanColumn"
import { batchMoveTask } from "@/modules/tasks/services/task-batch-service"
import { KANBAN_COLUMNS } from "@/modules/tasks/services/types/task-types"
import type { Task, TaskStatus } from "@/modules/tasks/services/types/task-types"

interface KanbanBoardProps {
  tasks: Task[]
  groupedTasks: (status: TaskStatus) => Task[]
  onAddTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onUpdateTask?: (task: Task) => void
  onMoveTask?: (taskId: string, toStatus: TaskStatus, newOrder: number) => void
  onRestoreTask?: (task: Task) => void
}

export function KanbanBoard({
  tasks,
  groupedTasks,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onMoveTask,
  onRestoreTask,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event
    if (!over || active.id === over.id) return

    const taskId = active.id as string
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Capture the original task BEFORE any optimistic update for correct rollback
    const originalTask = task

    const overId = over.id as string
    const isColumn = KANBAN_COLUMNS.some((col) => col.id === overId)

    let targetStatus: TaskStatus
    let targetIndex: number

    if (isColumn) {
      targetStatus = overId as TaskStatus
      targetIndex = groupedTasks(targetStatus).length
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return
      targetStatus = overTask.status
      const colTasks = groupedTasks(targetStatus).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      targetIndex = colTasks.findIndex((t) => t.id === overId)
      if (targetIndex === -1) targetIndex = colTasks.length
    }

    const fromStatus = task.status

    // BUG FIX: compute oldIndex BEFORE optimistic update so same-column reorder works
    const oldIndex = groupedTasks(fromStatus).findIndex((t) => t.id === taskId)

    if (fromStatus === targetStatus && oldIndex === targetIndex) return

    // Optimistic update
    onMoveTask?.(taskId, targetStatus, targetIndex)

    try {
      await batchMoveTask({
        taskId,
        fromStatus,
        toStatus: targetStatus,
        newOrder: targetIndex,
        columnTasks: tasks,
      })

      if (fromStatus !== targetStatus) {
        toast.success(`Moved to ${KANBAN_COLUMNS.find((c) => c.id === targetStatus)?.title}`)
      }
    } catch (error) {
      // Rollback: restore the original task state
      onRestoreTask?.(originalTask)
      toast.error("Failed to move task. Changes reverted.")
    }
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full min-h-0 overflow-x-auto pb-2">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={groupedTasks(col.id)}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <KanbanCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
