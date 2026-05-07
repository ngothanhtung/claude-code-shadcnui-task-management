import type { Task } from "@/modules/tasks/services/types/task-types"

export function getTaskStats(tasks: Task[]) {
  return {
    total: tasks.length,
    todo: tasks.filter((task) => task.status === "todo").length,
    inProgress: tasks.filter((task) => task.status === "in-progress").length,
    done: tasks.filter((task) => task.status === "done").length,
  }
}
