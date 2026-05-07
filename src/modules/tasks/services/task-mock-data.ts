import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  PlayCircle,
} from "lucide-react"

import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import tasksData from "./data/tasks.json"
import { taskSchema } from "./types/task-types"

export const tags = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Documentation" },
  { value: "improvement", label: "Improvement" },
  { value: "refactor", label: "Refactor" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance" },
  { value: "ui", label: "UI" },
  { value: "backend", label: "Backend" },
  { value: "testing", label: "Testing" },
]

export const statuses = [
  { value: "todo", label: "To Do", icon: Circle },
  { value: "in-progress", label: "In Progress", icon: PlayCircle },
  { value: "done", label: "Done", icon: CheckCircle2 },
]

export const priorities = [
  { value: "low", label: "Low", icon: ArrowDown },
  { value: "medium", label: "Medium", icon: AlertCircle },
  { value: "high", label: "High", icon: ArrowUp },
]

export const taskMockData = taskSchema.array().parse(tasksData)

export function seedTasksMockData() {
  return seedMockDataCollections("tasks", [
    {
      collectionName: "tasks",
      documents: taskMockData,
    },
  ])
}
