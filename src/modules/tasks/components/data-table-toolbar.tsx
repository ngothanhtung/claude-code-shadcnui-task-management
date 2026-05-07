"use client"

import type { Table } from "@tanstack/react-table"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddTaskModal } from "./add-task-modal"

import { priorities, statuses, tags } from "@/modules/tasks/services/task-mock-data"
import type { Task } from "@/modules/tasks/services/types/task-types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddTask?: (task: Task) => void
}

export function DataTableToolbar<TData>({
  table,
  onAddTask,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const statusFilter = table.getColumn("status")?.getFilterValue() as string | undefined
  const priorityFilter = table.getColumn("priority")?.getFilterValue() as string | undefined
  const tagsFilter = table.getColumn("tags")?.getFilterValue() as string[] | undefined
  const assigneeFilter = table.getColumn("assigneeId")?.getFilterValue() as string | undefined

  const selectedTags = new Set(tagsFilter ?? [])

  const uniqueAssignees = Array.from(
    new Set(
      (table.getFilteredRowModel().rows.length > 0
        ? table.getFilteredRowModel().rows
        : table.getRowModel().rows
      )
        .map((row) => (row.original as Task).assigneeId)
        .filter(Boolean) as string[]
    )
  ).sort()

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {/* Status Filter */}
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            const col = table.getColumn("status")
            if (value === "all") col?.setFilterValue(undefined)
            else col?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value} className="cursor-pointer">
                <div className="flex items-center">
                  {s.icon && <s.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  {s.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={priorityFilter || "all"}
          onValueChange={(value) => {
            const col = table.getColumn("priority")
            if (value === "all") col?.setFilterValue(undefined)
            else col?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Priorities</SelectItem>
            {priorities.map((p) => (
              <SelectItem key={p.value} value={p.value} className="cursor-pointer">
                <div className="flex items-center">
                  {p.icon && <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                  {p.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags Filter */}
        <Select
          value={selectedTags.size === 1 ? [...selectedTags][0] : "all"}
          onValueChange={(value) => {
            const col = table.getColumn("tags")
            if (value === "all") col?.setFilterValue(undefined)
            else col?.setFilterValue([value])
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.value} value={tag.value} className="cursor-pointer">
                {tag.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={assigneeFilter || "all"}
          onValueChange={(value) => {
            const col = table.getColumn("assigneeId")
            if (value === "all") col?.setFilterValue(undefined)
            else col?.setFilterValue(value)
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Assignees</SelectItem>
            {uniqueAssignees.map((a) => (
              <SelectItem key={a} value={a} className="cursor-pointer">
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search and Actions Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search tasks..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="w-50 lg:w-75 cursor-text"
          />
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="px-3 cursor-pointer"
            disabled={!isFiltered}
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden lg:block">Reset Filters</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <DataTableViewOptions table={table} />
          <AddTaskModal onAddTask={onAddTask} />
        </div>
      </div>
    </div>
  )
}
