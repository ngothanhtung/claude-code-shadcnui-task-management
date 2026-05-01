"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/modules/register-users/components/data-table"
import { RegisterUsersStatCards } from "@/modules/register-users/components/register-users-stat-cards"
import {
  addRegisterUser,
  deleteRegisterUser,
  getRegisterUsers,
  getRegisterUserStats,
  updateRegisterUser,
} from "@/modules/register-users/services/register-users-services"
import type { RegisterUserItem } from "@/modules/register-users/services/types/register-users-types"

export default function RegisterUsersPage() {
  const [users, setUsers] = useState<RegisterUserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getRegisterUsers()
        setUsers(data)
      } catch (error) {
        console.error("Failed to load register users:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  const handleAddUser = async (newUser: RegisterUserItem) => {
    try {
      const docId = await addRegisterUser(newUser)
      setUsers(prev => [{ ...newUser, id: docId }, ...prev])
      toast.success("Registration created successfully")
    } catch (error) {
      console.error("Failed to add registration:", error)
      toast.error("Failed to create registration")
    }
  }

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const handleEditUser = async (updatedUser: RegisterUserItem) => {
    if (!updatedUser.id) return
    try {
      await updateRegisterUser(updatedUser.id, updatedUser)
      setUsers(prev =>
        prev.map(u => u.id === updatedUser.id ? updatedUser : u)
      )
      toast.success("Registration updated successfully")
    } catch (error) {
      console.error("Failed to update registration:", error)
      toast.error("Failed to update registration")
    }
  }

  const stats = getRegisterUserStats(users)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Customer Registrations</h1>
        <p className="text-muted-foreground">
          Manage and track customers who registered for consultation.
        </p>
      </div>

      {/* Mobile view placeholder */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Registrations Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full registrations interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <RegisterUsersStatCards stats={stats} />

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>
              View, filter, and manage all customer registrations in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onEditUser={handleEditUser}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
