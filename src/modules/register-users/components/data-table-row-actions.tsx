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

import { deleteRegisterUser } from "@/modules/register-users/services/register-users-services"
import type { RegisterUserItem } from "@/modules/register-users/services/types/register-users-types"
import { EditRegisterUserModal } from "./edit-register-user-modal"

interface DataTableRowActionsProps {
  row: Row<RegisterUserItem>
  onDelete?: (id: string) => void
  onEdit?: (user: RegisterUserItem) => void
}

export function DataTableRowActions({
  row,
  onDelete,
  onEdit,
}: DataTableRowActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const user = row.original

  const handleDelete = async () => {
    if (!user.id) return
    setDeleting(true)
    try {
      await deleteRegisterUser(user.id)
      onDelete?.(user.id)
      toast.success("Registration deleted successfully")
    } catch (error) {
      console.error("Failed to delete registration:", error)
      toast.error("Failed to delete registration")
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  const handleSaveEdit = (updated: RegisterUserItem) => {
    onEdit?.(updated)
    toast.success("Registration updated successfully")
  }

  const handleSendEmail = () => {
    if (user.email) {
      window.location.href = `mailto:${user.email}`
    }
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
          <EditRegisterUserModal user={user} onSave={handleSaveEdit} />
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
            <DropdownMenuShortcut className="text-red-600 dark:text-red-400">
              Del
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Delete Registration</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete the registration for{" "}
              <span className="font-medium text-foreground">{user.name}</span>?
              This action cannot be undone.
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
