"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { priorities, statuses, tags } from "@/modules/tasks/services/task-mock-data"
import type { Task } from "@/modules/tasks/services/types/task-types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export function getColumns({
  onDelete,
  onUpdate,
}: {
  onDelete: (task: Task) => void
  onUpdate: (task: Task) => Promise<void>
}): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => (
        <div className="w-25 font-medium">{row.getValue("id")}</div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1 max-w-87.5">
            <span className="truncate font-medium">{row.getValue("title")}</span>
            {row.original.description && (
              <span className="text-xs text-muted-foreground truncate">
                {row.original.description}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (s) => s.value === row.getValue("status")
        )
        if (!status) return null
        return (
          <div className="flex w-32.5 items-center">
            {status.icon && (
              <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">{status.label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (p) => p.value === row.getValue("priority")
        )
        if (!priority) return null

        const priorityColors: Record<string, string> = {
          high: "border-red-500 text-red-600 dark:text-red-400",
          medium: "border-yellow-500 text-yellow-700 dark:text-yellow-400",
          low: "border-slate-400 text-slate-600 dark:text-slate-400",
        }

        return (
          <div className="flex items-center">
            <Badge
              variant="outline"
              className={cn(
                "pl-2",
                priorityColors[priority.value] ?? ""
              )}
            >
              <span className="text-sm">{priority.label}</span>
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => {
        const taskTags: string[] = row.getValue("tags") ?? []
        if (!taskTags.length) return null
        return (
          <div className="flex flex-wrap gap-1 w-50">
            {taskTags.slice(0, 3).map((tag) => {
              const tagOption = tags.find((t) => t.value === tag)
              return (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tagOption?.label ?? tag}
                </Badge>
              )
            })}
            {taskTags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{taskTags.length - 3}
              </Badge>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const rowTags: string[] = row.getValue(id) ?? []
        return value.every((v: string) => rowTags.includes(v))
      },
      enableHiding: true,
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as string | number | Date | undefined
        if (!dueDate) return <span className="text-muted-foreground text-sm">—</span>
        const date = new Date(dueDate)
        const isOverdue = date < new Date()
        return (
          <span
            className={cn(
              "text-sm",
              isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"
            )}
          >
            {format(date, "MMM d, yyyy")}
          </span>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue("dueDate") as string | number | Date | undefined
        const b = rowB.getValue("dueDate") as string | number | Date | undefined
        if (!a && !b) return 0
        if (!a) return 1
        if (!b) return -1
        return new Date(a).getTime() - new Date(b).getTime()
      },
      enableHiding: true,
    },
    {
      accessorKey: "assigneeId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignee" />
      ),
      cell: ({ row }) => {
        const assigneeId = row.getValue("assigneeId") as string | undefined
        if (!assigneeId) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {assigneeId}
          </span>
        )
      },
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} onDelete={onDelete} onUpdate={onUpdate} />
      ),
    },
  ]
}

export const columns: ColumnDef<Task>[] = []
