"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import type { RegisterUserItem } from "@/modules/register-users/services/types/register-users-types"
import { DataTableColumnHeader } from "@/modules/tasks/components/data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

function formatCreatedAt(value?: string): string {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getColumns(
  onDelete: (id: string) => void,
  onEdit: (user: RegisterUserItem) => void
): ColumnDef<RegisterUserItem>[] {
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
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="block truncate font-medium text-xs">
          {row.getValue("id")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="truncate font-medium">{row.getValue("name")}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
      filterFn: (row, id, value) => {
        const search = String(value).toLowerCase()
        const user = row.original

        return [row.getValue(id), user.email, user.phone, user.message]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(search))
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.getValue("phone") || "-"}</span>
      ),
    },
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Message" />
      ),
      cell: ({ row }) => {
        const message = row.getValue("message") as string

        return (
          <span className="text-sm text-muted-foreground truncate block">
            {message || "-"}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => (
        <span className="block text-sm">
          {formatCreatedAt(row.getValue("createdAt"))}
        </span>
      ),
      sortingFn: "datetime",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions row={row} onDelete={onDelete} onEdit={onEdit} />
      ),
    },
  ]
}
