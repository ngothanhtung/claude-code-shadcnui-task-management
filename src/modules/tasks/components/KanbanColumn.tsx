"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Circle, PlayCircle, CheckCircle2, Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { AddTaskModal } from "@/modules/tasks/components/add-task-modal"
import { KanbanCard } from "@/modules/tasks/components/KanbanCard"
import type { Task, TaskStatus } from "@/modules/tasks/services/types/task-types"

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
  onAddTask?: (task: Task) => void
  onUpdateTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
}

const COLUMN_ICONS: Record<TaskStatus, typeof Circle> = {
  "todo": Circle,
  "in-progress": PlayCircle,
  "done": CheckCircle2,
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  "todo": "text-muted-foreground",
  "in-progress": "text-blue-500",
  "done": "text-green-500",
}

export function KanbanColumn({ id, title, tasks, onAddTask, onUpdateTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const [showAddModal, setShowAddModal] = useState(false)

  const Icon = COLUMN_ICONS[id]
  const taskIds = tasks.map((t) => t.id)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${COLUMN_COLORS[id]}`} />
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 cursor-pointer"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border border-dashed transition-colors overflow-hidden ${
          isOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <ScrollArea className="h-full p-2">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                No tasks
              </div>
            ) : (
              tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </SortableContext>
        </ScrollArea>
      </div>

      <AddTaskModal
        onAddTask={onAddTask}
        defaultStatus={id}
        defaultOrder={tasks.length}
        trigger={
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="size-3.5 mr-1" />
            Add task
          </Button>
        }
      />
    </div>
  )
}
