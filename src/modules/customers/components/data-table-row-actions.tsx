"use client"

import { useState } from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Trash2, Eye, Mail, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { deleteCustomer } from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"
import { EditCustomerModal } from "./edit-customer-modal"

interface DataTableRowActionsProps {
  row: Row<Customer>
  onDelete?: (id: string) => void
  onEdit?: (customer: Customer) => void
}

export function DataTableRowActions({
  row,
  onDelete,
  onEdit,
}: DataTableRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const customer = row.original

  const handleDelete = async () => {
    if (!customer.id) return
    setDeleting(true)
    try {
      await deleteCustomer(customer.id)
      onDelete?.(customer.id)
      toast.success("Customer deleted successfully")
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast.error("Failed to delete customer")
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const handleSendEmail = () => {
    if (customer.email) {
      window.location.href = `mailto:${customer.email}`
    }
  }

  const handleSaveEdit = (updated: Customer) => {
    onEdit?.(updated)
    toast.success("Customer updated successfully")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer">
            <Eye className="mr-2 size-4" />
            View Details
          </DropdownMenuItem>
          <EditCustomerModal customer={customer} onSave={handleSaveEdit} />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleSendEmail}
          >
            <Mail className="mr-2 size-4" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            <Trash2 className="mr-2 size-4" />
            Delete
            <DropdownMenuShortcut className="text-red-600 dark:text-red-400">⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Delete Customer</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{customer.name}</span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}