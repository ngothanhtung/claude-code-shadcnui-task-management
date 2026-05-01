"use client"

import { useEffect, useState } from "react"
import { Users, Phone, CheckCircle2, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { columns } from "@/modules/register-users/components/columns"
import { DataTable } from "@/modules/register-users/components/data-table"
import { getRegisterUsers, getRegisterUserStats } from "@/modules/register-users/services/register-users-services"
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

  const handleAddUser = (newUser: RegisterUserItem) => {
    setUsers((prev) => [newUser, ...prev])
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
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Customer Registrations</h1>
        <p className="text-muted-foreground">
          Manage and track customers who registered for consultation.
        </p>
      </div>

      <div className="h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Registrations</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Users className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.pending}</span>
                  </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-950 rounded-lg p-3">
                  <Clock className="size-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Contacted</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.contacted}</span>
                  </div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-950 rounded-lg p-3">
                  <Phone className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats.completed}</span>
                  </div>
                </div>
                <div className="bg-green-100 dark:bg-green-950 rounded-lg p-3">
                  <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Registrations</CardTitle>
            <CardDescription>
              View, filter, and manage all customer registrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={users} columns={columns} onAddUser={handleAddUser} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
