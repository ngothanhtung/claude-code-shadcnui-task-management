"use client"

import { useSearchParams } from "next/navigation"
import {
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  ListTodo,
} from "lucide-react"
import { Suspense } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { AddTaskModal } from "@/modules/tasks/components/add-task-modal"
import { KanbanBoard } from "@/modules/tasks/components/KanbanBoard"
import { DataTable } from "@/modules/tasks/components/data-table"
import { getColumns } from "@/modules/tasks/components/columns"
import { useTasks } from "@/modules/tasks/services/useTasks"
import { getTaskStats } from "@/modules/tasks/services/task-services"

function TasksContent() {
  const searchParams = useSearchParams()
  const view = (searchParams.get("view") as "list" | "kanban") ?? "list"

  const {
    tasks,
    loading,
    addTask,
    deleteTask,
    updateTask,
    moveTask,
    restoreTask,
    groupedTasks,
  } = useTasks()

  const stats = getTaskStats(tasks)
  const columns = getColumns({ onDelete: deleteTask, onUpdate: updateTask })

  const handleMoveTask = (
    taskId: string,
    toStatus: Parameters<typeof moveTask>[1],
    newOrder: number
  ) => {
    moveTask(taskId, toStatus, newOrder, tasks)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground text-sm">
              A powerful task and issue tracker built with Tanstack Table.
            </p>
          </div>
          <AddTaskModal onAddTask={addTask} />
        </div>
      </div>

      {/* Mobile view placeholder */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Tasks Dashboard</h3>
            <p className="text-muted-foreground text-sm">
              Please use a larger screen to view the full tasks interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Tasks
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.total}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats.total > 0
                        ? Math.round((stats.done / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <ListTodo className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Done
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.done}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {Math.round((stats.done / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <CheckCircle2 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    In Progress
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {stats.inProgress}
                    </span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {Math.round((stats.inProgress / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Clock className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    To Do
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.todo}</span>
                    <span className="flex items-center gap-0.5 text-sm text-orange-500">
                      <ArrowUp className="size-3.5" />
                      {Math.round((stats.todo / stats.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <BarChart3 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  View, filter, and manage all your project tasks in one place.
                </CardDescription>
              </div>
              {/* View Toggle */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <a
                  href="?view=list"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === "list"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="size-4" />
                  List
                </a>
                <a
                  href="?view=kanban"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === "kanban"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="size-4" />
                  Kanban
                </a>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {view === "kanban" ? (
              <div className="h-[calc(100vh-22rem)] min-h-100">
                <KanbanBoard
                  tasks={tasks}
                  groupedTasks={groupedTasks}
                  onAddTask={addTask}
                  onDeleteTask={deleteTask}
                  onUpdateTask={updateTask}
                  onMoveTask={handleMoveTask}
                  onRestoreTask={restoreTask}
                />
              </div>
            ) : (
              <DataTable data={tasks} columns={columns} onAddTask={addTask} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function TaskPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  )
}
