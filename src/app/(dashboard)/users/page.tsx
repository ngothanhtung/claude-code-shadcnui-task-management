"use client"

import { useEffect, useState } from "react"
import { StatCards } from "@/modules/users/components/stat-cards"
import { DataTable } from "@/modules/users/components/data-table"
import { createUser, getUsers } from "@/modules/users/services/user-services"
import type { User, UserFormValues } from "@/modules/users/services/types/user-types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  const handleAddUser = (userData: UserFormValues) => {
    const newUser = createUser(users, userData)
    setUsers(prev => [newUser, ...prev])
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    setEditingUser(null)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
      </div>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          users={users}
          editingUser={editingUser}
          onDeleteUser={handleDeleteUser}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onEditDialogClose={() => setEditingUser(null)}
        />
      </div>
    </div>
  )
}
