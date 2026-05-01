"use client"

import type { Table } from "@tanstack/react-table"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddRegisterUserModal } from "./add-register-users-modal"
import type { RegisterUserItem } from "@/modules/register-users/services/types/register-users-types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddUser?: (user: RegisterUserItem) => void
}

export function DataTableToolbar<TData>({
  table,
  onAddUser,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by name, email, phone, message..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
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
        <AddRegisterUserModal onAddUser={onAddUser} />
      </div>
    </div>
  )
}
