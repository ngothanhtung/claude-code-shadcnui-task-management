"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { RegisterUserItem } from "@/modules/register-users/services/types/register-users-types"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditRegisterUserModalProps {
  user: RegisterUserItem
  onSave?: (user: RegisterUserItem) => void
}

export function EditRegisterUserModal({
  user,
  onSave,
}: EditRegisterUserModalProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormData>({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    message: user.message ?? "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      message: user.message ?? "",
    })
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const validated = formSchema.parse(form)
      const updated: RegisterUserItem = { ...user, ...validated }

      onSave?.(updated)
      setErrors({})
      setOpen(false)
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message
        })
        setErrors(newErrors)
      }
    }
  }

  const handleCancel = () => {
    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer w-full justify-start"
        >
          <Pencil className="mr-2 size-4" />
          Edit Registration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Registration</DialogTitle>
          <DialogDescription>
            Update information for &quot;{user.name}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              value={form.phone || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-message">Message</Label>
            <Textarea
              id="edit-message"
              value={form.message || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, message: e.target.value }))
              }
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
